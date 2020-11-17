import * as React from 'react';
import * as _ from 'lodash';
import { observable, action } from 'mobx';
import { App } from '../../App';
import * as felsocket from '../../felsocket';
import { IQuizReturnMsg, IMsg, IQNAMsg, IScript, IData, IQnaReturn } from '../common';
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
			questionProg: SENDPROG.READY,
			scriptProg: SENDPROG.READY,
			qnaProg: SENDPROG.READY,
			dialogueProg: SENDPROG.READY,
		}

		this.actions = {
			...this.actions,
			getData: () => this._data,
			getResult: () => this._result,
			gotoDirection: () => this._setViewDiv('direction'),
			gotoNextBook: () => felsocket.sendLauncher($SocketType.GOTO_NEXT_BOOK, null),
	
			getReturnUsers: () => this._returnUsers,
			clearReturnUsers: () => {this._returnUsers = [];},
	
			getReturnUsersForQuiz: () => this._returnUsersForQuiz,
			clearReturnUsersForQuiz: () => this._returnUsersForQuiz = [],
			
			getQnaReturns: () => this._qnaReturns,
			quizComplete: () => 
			this.state = {
				...this.state,
				questionProg: SENDPROG.COMPLETE,
			},
			clearQnaReturns: () => {			
				this._returnUsers = [];
				for(let i = 0; i < this._data.scripts.length; i++) {
					this._qnaReturns[i] = {num: 0, users: []};
				}
				this.actions.setRetCnt(0);
			},
			init: () => {		
				this.state = {
					...this.state,				
					scriptProg: SENDPROG.READY,
					qnaProg: SENDPROG.READY,
					dialogueProg: SENDPROG.READY,
				}
				this._returnUsers = [];

				if(this.state.questionProg < SENDPROG.COMPLETE) {
					this.state.questionProg = SENDPROG.READY;
					this._returnUsersForQuiz = [];
					for(let i = 0; i < this._data.quizs.length; i++) {
						this._result[i] = {numOfCorrect: 0, c1: 0, u1: [], c2: 0, u2: [], c3: 0, u3: [],};
					}
				}
				for(let i = 0; i < this._data.scripts.length; i++) {
					this._qnaReturns[i] = {num: 0, users: []};
				}
			},
		}
	}

	@action protected _setViewDiv(viewDiv: VIEWDIV) {
		if(this.state.viewDiv !== viewDiv) {
			if(viewDiv !== 'content') {
				_.delay(this.actions.init, 300);		
			}
		}
		super._setViewDiv(viewDiv);
	}

	private _uploadInclassReport = (qmsg: IQuizReturnMsg) => {
		const quizs = this._data.quizs;
		const userReports: IInClassReport[] = [];

		quizs.forEach((quiz, idx) => {
			const ret = qmsg.returns[idx];
			const stime = StrUtil._toStringTimestamp(new Date(ret.stime));
			const etime = StrUtil._toStringTimestamp(new Date(ret.etime));
			if(ret && quiz.tmq_seq) {
				userReports.push({
					std_cont_seq: quiz.tmq_seq,
					studentId: qmsg.id,
					ans_tf: ret.answer === quiz.answer ? '1' : '0',
					ans_submit: '' + ret.answer,
					ans_starttime: stime,
					ans_endtime: etime,
					sc_div1: quiz.SC_DIV1 ? quiz.SC_DIV1 : '',
					sc_div2: quiz.SC_DIV2 ? quiz.SC_DIV2 : '',
					sc_div3: quiz.SC_DIV3 ? quiz.SC_DIV3 : '',
					sc_div4: quiz.SC_DIV4 ? quiz.SC_DIV4 : '',
					files: null,
					ans_correct: '' + quiz.answer,
					tab_index: ''
				});	
			}
		});

		if(userReports.length > 0) {
			console.log('inclassReport(LogFromContentTeacher): ', userReports); // 비상요청 사항                        
			felsocket.uploadInclassReport(userReports);
		}
	}

	public receive(data: ISocketData) {
		super.receive(data);
		// console.log('receive', data);
		if(data.type === $SocketType.MSGTOTEACHER && data.data) {
			const msg = data.data as  IMsg;
			if(msg.msgtype === 'quiz_return') {
				if(this.state.questionProg === SENDPROG.SENDED) {
					const qmsg = msg as IQuizReturnMsg;
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
						for(let i = 0; i < qmsg.returns.length; i++) {  // 문제별 
							if(i < this._result.length) {
								const quiz = this._data.quizs[i];
								const ret = qmsg.returns[i];						// 사용자가 선택한 번호
								const result = this._result[i];					// 결과 저장 	

								if(ret.answer === quiz.answer) result.numOfCorrect++;
								if(ret.answer === 1) {
									result.c1++;
									result.u1.push(qmsg.id);
								} else if(ret.answer === 2) {
									result.c2++;
									result.u2.push(qmsg.id);
								} else if(ret.answer === 3) {
									result.c3++;
									result.u3.push(qmsg.id);
								}
							}
						}

						this._uploadInclassReport(qmsg);

					}
				}
			} else if(msg.msgtype === 'qna_return') {
				if(this.state.qnaProg === SENDPROG.SENDED) {
					const qmsg = msg as IQNAMsg;
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
					const scripts = this._data.scripts;
					if( qmsg.returns.length > 0) {
						qmsg.returns.forEach((val,idx) => {
							const script = scripts[val];
							if(script) {
								if(ans_submit === 'qna;') ans_submit += script.seq + '|' + script.dms_eng;
								else ans_submit += '§' + script.seq + '|' + script.dms_eng;
							}
						});
					}
					
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
		// 사전 학습 관련 데이터 셋팅 을 위한 함수 (문장별 학생 전체 평균값 구하기) 
		const q_arr = [70, 60, 80];		

		const scripts = this._data.scripts;
		const speakerA = this._data.speakerA.name;
		const speakerB = this._data.speakerB.name;
		const speakerC = this._data.speakerC.name;

		if(!this._data.speakerD) {
			this._data.speakerD = {
				name: '',
				image_s: '',
				image_l: '',
			};
		}
		if(!this._data.speakerE) {
			this._data.speakerE = {
				name: '',
				image_s: '',
				image_l: '',
			};
		}
		const speakerD = this._data.speakerD.name;

		for(let i = 0; i < this._data.quizs.length; i++) {
			const q = this._data.quizs[i];
			const question = q.question.replace(/\<br\>/g, ' ');

			q.app_question = (<>{question}</>);
			
			if(i < q_arr.length) q.app_preview = q_arr[i];
			else q.app_preview = -1;

			this._result[i] = {numOfCorrect: 0, c1: 0, u1: [], c2: 0, u2: [], c3: 0, u3: []};
		}

		const previewMsg: IPreviewClassMsg[] = [];
	
		for(let i = 0; i < scripts.length; i++) {
			const script = scripts[i];
			if(script.sc_COD && !App.isDvlp && script.sc_COD[0] !== undefined) {
				previewMsg.push({
					evalCode: '2',
					vsFromData: 'script',
					vsFromSeq: Number(script.sc_COD[0].codSeq)
				});
			} 
			
			if(script.dms_speaker === speakerA) script.roll = 'A';
			else if (script.dms_speaker === speakerB) script.roll = 'B';
			else if (script.dms_speaker === speakerC) script.roll = 'C';
			else if (script.dms_speaker === speakerD) script.roll = 'D';
			else script.roll = 'E';

			this._qnaReturns[i] = {num: 0, users: []};
		}

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
				let resultScript: IScript[] = [];
				for(let i = 0; i < scripts.length; i++) {
					const script = scripts[i];
					if(script.sc_COD) {
						resultScript.push(script);
					}
				}

				for(let i = 0; i < resultScript.length; i++) {
					resultScript[i].app_preview = val_arr_meaning[i].avg;
				}
				
				for(let i = 0; i < resultScript.length; i++) {
					let idx = scripts.findIndex((item,lidx) => {
						return item.dms_seq === resultScript[i].dms_seq;
					});
					scripts[idx].app_preview = resultScript[i].app_preview;
				}
			} else {
				for(let i = 0; i < scripts.length; i++) {
					const script = scripts[i];
					script.app_preview = -1;
				}
			}// 서버에서 받아온 1view 사전 학습 결과값이 없으면 -1로 셋팅 
		
		} else {
			for(let i = 0; i < scripts.length; i++) {
				const script = scripts[i];
				if(i === 0) script.app_preview = 80;
				else script.app_preview = i * 2;

			}
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