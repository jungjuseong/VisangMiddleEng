import * as React from 'react';

import * as _ from 'lodash';
import { observable, action } from 'mobx';
import { App } from '../../App';
import * as felsocket from '../../felsocket';
import { IQuizReturnMsg,IQNAMsg,IData,IScript,IQnaReturn,IMsg } from '../common';
import { TeacherContextBase, VIEWDIV, IStateBase, IActionsBase } from '../../share/tcontext';
import * as StrUtil from '@common/util/StrUtil';

const enum SENDPROG {
	READY,
	SENDING,
	SENDED,
	COMPLETE,
}

/** 1View 사전학습 데이터 관련 인터페이스 */
interface IValArr {
	avg: number;
	cnt: number;
	sum: number;
	txt: string;
}

interface IQuizResult {
	numOfCorrect: number;
	c1: number;
	u1: string[];
	c2: number;
	u2: string[];
	c3: number;
	u3: string[];
} 

interface IStateCtx extends IStateBase {
	hasPreview: boolean;
	confirmProg: SENDPROG;
	additionalProg: SENDPROG;
	dictationProg: SENDPROG;
	scriptProg: SENDPROG;
	qnaProg: SENDPROG;
	dialogueProg: SENDPROG;
	scriptResult: number[];
}

interface IActionsCtx extends IActionsBase {
	getData: () => IData;
	getResult: () => IQuizResult[];
	gotoDirection: () => void;
	gotoNextBook: () => void;
	getReturnUsers: () => string[];
	clearReturnUsers: () => void;
	getReturnUsersForQuiz: () => string[];
	clearReturnUsersForQuiz: () => void;	
	getQnaReturns: () => IQnaReturn[];
	clearQnaReturns: () => void;
	quizComplete: () => void;	
	init: () => void;
}

class TeacherContext extends TeacherContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;
	private _data!: IData;

	private _result: IQuizResult[] = [];
	private _returnUsers: string[] = [];

	private _returnUsersForQuiz: string[] = [];
	private _qnaReturns: IQnaReturn[] = [];

	constructor() {
		super();

		this.state = {
			...this.state,
			hasPreview: false,
			confirmProg: SENDPROG.READY,
			additionalProg: SENDPROG.READY,
			dictationProg: SENDPROG.READY,
			scriptProg: SENDPROG.READY,
			qnaProg: SENDPROG.READY,
			dialogueProg: SENDPROG.READY
		}

		this.actions.init = () => {	
			this.state = {
				...this.state,
				scriptProg: SENDPROG.READY,
				qnaProg: SENDPROG.READY,
				dialogueProg: SENDPROG.READY
			};
			this._returnUsers = [];

			if(this.state.confirmProg < SENDPROG.COMPLETE) {
				this.state.confirmProg = SENDPROG.READY;
				this._returnUsersForQuiz = [];
			}
		};

		this.actions = {
			...this.actions,
			getData: () => this._data,
			getResult: () => this._result,
			gotoDirection: () => this._setViewDiv('direction'),
			gotoNextBook: () => felsocket.sendLauncher($SocketType.GOTO_NEXT_BOOK, null),
			getReturnUsers: () => this._returnUsers,
			clearReturnUsers: () => this._returnUsers = [],
			getReturnUsersForQuiz: () => this._returnUsersForQuiz,
			clearReturnUsersForQuiz: () => this._returnUsersForQuiz = [],
			getQnaReturns: () => this._qnaReturns,
			quizComplete: () =>  {this.state.confirmProg = SENDPROG.COMPLETE
			console.log('quizComplete',this.state.confirmProg)},
			clearQnaReturns: () => {			
				this._returnUsers = [];
				this.actions.setRetCnt(0);
			},
		};
	}

	@action protected _setViewDiv(newViewDiv: VIEWDIV) {
		const { viewDiv } = this.state;
		if(viewDiv !== newViewDiv) {
			if(viewDiv !== 'content') {
				_.delay(this.actions.init, 300);		
			}
		}
		super._setViewDiv(newViewDiv);
	}

	private _uploadInclassReport = (quizMessage: IQuizReturnMsg) => {
		const userReports: IInClassReport[] = [];

		if(userReports.length > 0) {
			console.log('inclassReport(LogFromContentTeacher): ', userReports); // 비상요청 사항                        
			felsocket.uploadInclassReport(userReports);
		}
	}

	public receive(messageFromPad: ISocketData) {
		super.receive(messageFromPad);
		// console.log('receive', data);
		if(messageFromPad.type === $SocketType.MSGTOTEACHER && messageFromPad.data) {
			const messageType = (messageFromPad.data as  IMsg).msgtype;
			switch(messageType) {
			case 'confirm_return':
				if(this.state.confirmProg === SENDPROG.SENDED) {
					const quizReturnMsg = (messageFromPad.data as IQuizReturnMsg);
					let sidx = -1;
					for(let i = 0; i < App.students.length; i++) {
						if(App.students[i].id === quizReturnMsg.id) {
							sidx = i;
							break;
						}
					}
					const ridx = this._returnUsersForQuiz.indexOf(quizReturnMsg.id);
					if(sidx >= 0 && ridx < 0) {
						this._returnUsersForQuiz.push(quizReturnMsg.id);
						felsocket.addStudentForStudentReportType6(quizReturnMsg.id);
						this.actions.setRetCnt(this._returnUsersForQuiz.length);
						this._uploadInclassReport(quizReturnMsg);
					}
				}
				break;
			}
		}

	}
	
	public async setData(data: any) {
		this._data = data as IData;
		this.state.hasPreview = true;
			
		function _initAvgPercent(text_arr: string[], val_arr: any[], preview_data: IPreviewResultClassMember[]) {
		
			for(let i = 0; i < preview_data.length;i++) {
				if(!text_arr.includes(preview_data[i].textValue)) {
					text_arr.push(preview_data[i].textValue);
					val_arr.push({sum: 0, cnt: 0, avg: 0, txt: ''});
				}
			}
			for(let i = 0; i < preview_data.length;i++) {
				let txt = preview_data[i].textValue;
				let val = preview_data[i].avgPercent;
				let idx = text_arr.findIndex((item) => {
					return (item === txt);	
				});
				val_arr[idx].sum += val;
				val_arr[idx].cnt += 1;
				val_arr[idx].avg = Math.round(val_arr[idx].sum / val_arr[idx].cnt);
				val_arr[idx].txt = txt;			
			}
		}
		const previewMsg: IPreviewClassMsg[] = [];
	
		console.log('preview Msg~~~', previewMsg.length, previewMsg);

		let previewResult;
		let len = 0;
		let meaning_result;
		let text_arr_meaning: string[] = [];
		let val_arr_meaning: IValArr[] = [];

		if(!App.isDvlp && App.lang === 'ko') {
			previewResult =  await felsocket.getPreviewResultClass(previewMsg);
			len = previewResult.length;

			if(len > 0) {
				meaning_result = previewResult.filter((item,idx) => {
					return item.mttSeq === 6;
				});
			
				_initAvgPercent(text_arr_meaning,val_arr_meaning,meaning_result);
				console.log('text_arr', text_arr_meaning, 'val_arr', val_arr_meaning);
				// console.log("previewResult~~",previewResult)
				let resultScript: IScript[] = [];

				for(let i = 0; i < resultScript.length; i++) {
					resultScript[i].app_preview = val_arr_meaning[i].avg;
				}
			}// 서버에서 받아온 1view 사전 학습 결과값이 없으면 -1로 셋팅 
		
		}// 런처가 아닌 웹 용일 경우 임의 데이터
	
	}
}


const tContext = new TeacherContext();
const  { Provider: TProvider, Consumer: TeacherConsumer } = React.createContext( tContext );
class TeacherProvider extends React.Component<{}> {
	public render() {
		return (
			<TProvider value={tContext}>
				{this.props.children}
			</TProvider>
		);
	}
}

function useTeacher(WrappedComponent: any) {
	return function UseAnother(props: any) {
		return (
			<TeacherConsumer>{(store: TeacherContext) => (
					<WrappedComponent
						{...store}
					/>
			)}</TeacherConsumer>
		);
	};
}

export {
	TeacherContext,
	TeacherProvider,
	TeacherConsumer,
	tContext,
	useTeacher,
	IStateCtx,
	IActionsCtx,
	VIEWDIV,
	SENDPROG,
	IQuizResult,
};