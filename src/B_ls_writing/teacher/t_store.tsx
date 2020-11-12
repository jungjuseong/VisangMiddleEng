import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import { observable, action } from 'mobx';
import { App } from '../../App';
import * as felsocket from '../../felsocket';
import * as common from '../common';
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
	questionProg: SENDPROG;
	confirmProg: SENDPROG;
	additionalProg: SENDPROG;
	dictationProg: SENDPROG;
	scriptProg: SENDPROG;
	qnaProg: SENDPROG;
	dialogueProg: SENDPROG;
	scriptResult: number[];
}

interface IActionsCtx extends IActionsBase {
	getData: () => common.IData;
	getResult: () => IQuizResult[];
	gotoDirection: () => void;
	gotoNextBook: () => void;

	getReturnUsers: () => string[];
	clearReturnUsers: () => void;

	getReturnUsersForQuiz: () => string[];
	clearReturnUsersForQuiz: () => void;
	
	getQnaReturns: () => common.IQnaReturn[];
	clearQnaReturns: () => void;

	quizComplete: () => void;
	
	init: () => void;
}

class TeacherContext extends TeacherContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;
	private _data!: common.IData;

	private _result: IQuizResult[] = [];
	private _returnUsers: string[] = [];

	private _returnUsersForQuiz: string[] = [];
	private _qnaReturns: common.IQnaReturn[] = [];

	constructor() {
		super();
		this.state.hasPreview = false;
		this.state.questionProg = SENDPROG.READY;
		this.state.confirmProg = SENDPROG.READY;
		this.state.additionalProg = SENDPROG.READY;
		this.state.dictationProg = SENDPROG.READY;
		this.state.scriptProg = SENDPROG.READY;
		this.state.qnaProg = SENDPROG.READY;
		this.state.dialogueProg = SENDPROG.READY;

		this.actions.getData = () => this._data;
		this.actions.getResult = () => this._result;
		this.actions.gotoDirection = () => this._setViewDiv('direction');
		this.actions.gotoNextBook = () => {
			felsocket.sendLauncher($SocketType.GOTO_NEXT_BOOK, null);
		};

		this.actions.getReturnUsers = () => this._returnUsers;
		this.actions.clearReturnUsers = () => {this._returnUsers = [];};

		this.actions.getReturnUsersForQuiz = () => this._returnUsersForQuiz;
		this.actions.clearReturnUsersForQuiz = () => {
			this._returnUsersForQuiz = [];
		};
		
		this.actions.getQnaReturns = () => this._qnaReturns;
		this.actions.quizComplete = () => {
			this.state.questionProg = SENDPROG.COMPLETE;
		};
		this.actions.clearQnaReturns = () => {
			
			this._returnUsers = [];
			this.actions.setRetCnt(0);
		};

		this.actions.init = () => {			
			this.state.scriptProg = SENDPROG.READY;
			this.state.qnaProg = SENDPROG.READY;
			this.state.dialogueProg = SENDPROG.READY;
			this._returnUsers = [];

			if(this.state.questionProg < SENDPROG.COMPLETE) {
				this.state.questionProg = SENDPROG.READY;
				this._returnUsersForQuiz = [];
			}
		};
	}

	@action protected _setViewDiv(viewDiv: VIEWDIV) {
		if(this.state.viewDiv !== viewDiv) {
			if(viewDiv !== 'content') {
				_.delay(this.actions.init, 300);		
			}
		}
		super._setViewDiv(viewDiv);
	}

	private _uploadInclassReport = (qmsg: common.IQuizReturnMsg) => {
		const userReports: IInClassReport[] = [];

		if(userReports.length > 0) {
			console.log('inclassReport(LogFromContentTeacher): ', userReports); // 비상요청 사항                        
			felsocket.uploadInclassReport(userReports);
		}

	}

	public receive(data: ISocketData) {
		super.receive(data);
		// console.log('receive', data);
		if(data.type === $SocketType.MSGTOTEACHER && data.data) {
			const msg = data.data as  common.IMsg;
			if(msg.msgtype === 'quiz_return') {
				if(this.state.questionProg === SENDPROG.SENDED) {
					const qmsg = msg as common.IQuizReturnMsg;
					let sidx = -1;
					for(let i = 0; i < App.students.length; i++) {
						if(App.students[i].id === qmsg.id) {
							sidx = i;
							break;
						}
					}

					const ridx = this._returnUsersForQuiz.indexOf(qmsg.id);
					if(sidx >= 0 && ridx < 0) {
						this._returnUsersForQuiz.push(qmsg.id);
						felsocket.addStudentForStudentReportType6(qmsg.id);
						this.actions.setRetCnt(this._returnUsersForQuiz.length);

						this._uploadInclassReport(qmsg);

					}
				}
			} else if(msg.msgtype === 'qna_return') {
				if(this.state.qnaProg === SENDPROG.SENDED) {
					const qmsg = msg as common.IQNAMsg;
					let sidx = -1;
					for(let i = 0; i < App.students.length; i++) {
						if(App.students[i].id === qmsg.id) {
							sidx = i;
							break;
						}
					}

					const ridx = this._returnUsers.indexOf(qmsg.id);
					if(sidx >= 0 && ridx < 0) {
						for(let i = 0; i < qmsg.returns.length; i++) {  // 문제별 
							const scriptIdx = qmsg.returns[i];
							if(scriptIdx < this._qnaReturns.length) {
								const users = this._qnaReturns[scriptIdx].users;
								if(users.indexOf(qmsg.id) < 0) users.push(qmsg.id);

								this._qnaReturns[scriptIdx].num = users.length;
							}
						}
						this._returnUsers.push(qmsg.id);
						felsocket.addStudentForStudentReportType6(qmsg.id);
						this.actions.setRetCnt(this._returnUsers.length);
					}

					const userReports: IInClassReport[] = [];
					const stime = StrUtil._toStringTimestamp(new Date(qmsg.stime));
					const etime = StrUtil._toStringTimestamp(new Date(qmsg.etime));
					
					let ans_submit = 'qna;';
					
					userReports.push({
                        std_cont_seq: 0,
                        studentId: qmsg.id,
                        ans_tf: qmsg.returns.length === 0 ? '0' : '1',
                        ans_submit,
                        ans_starttime: stime ? stime : '',
                        ans_endtime: etime ? etime : '',
                        sc_div1: '',
                        sc_div2: '',
                        sc_div3: '',
                        sc_div4: '',
                        files: null,
                        ans_correct: '',
                        tab_index: '5',
                    });

					if(userReports.length > 0) {
						console.log('inclassReport(LogFromContentTeacher): ', userReports); // 비상요청 사항                        
						felsocket.uploadInclassReport(userReports);
					}
				}
			}
		}

	}
	
	public async setData(data: any) {
		this._data = data as common.IData;
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
	
		console.log('previewMsg~~~', previewMsg.length, previewMsg);
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
				let resultScript: common.IScript[] = [];

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