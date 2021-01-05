import * as React from 'react';

import * as _ from 'lodash';
import { observable, action } from 'mobx';
import { App } from '../../App';
import * as felsocket from '../../felsocket';
import { IQuizReturnMsg,IQNAMsg,IData,IScript,IQnaReturn,IMsg,initData, IIndexMsg,IQuizStringReturnMsg, IQuizStringReturn} from '../common';
import { TeacherContextBase, VIEWDIV, IStateBase, IActionsBase } from '../../share/tcontext';

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

interface IQuizNumResult {
	arrayOfCorrect: boolean[];
	c1: number[];
	c2: number[];
	c3: number[];
	uid: string[];
	url : string[][];
} 
interface IQuizStringResult {
	c1: string[];
	c2: string[];
	c3: string[];
	uid: string[];
	url : string[][];
} 

interface IQuizeStringArrayResult {
	arrayOfCorrect: boolean[];
	uid: string[];
	c0: IQuizStringResult[];
	url : string[][];
}

interface IStateCtx extends IStateBase {
	hasPreview: boolean;
	confirmBasicProg: SENDPROG;
	confirmSupProg: SENDPROG;
	confirmHardProg: SENDPROG;
	additionalBasicProg: SENDPROG;
	additionalSupProg: SENDPROG;
	additionalHardProg: SENDPROG;
	dictationProg: SENDPROG[];
	scriptProg: SENDPROG[];
	qnaProg: SENDPROG;
	scriptResult: number[];
	resultConfirmSup: IQuizNumResult;
	resultConfirmBasic: IQuizNumResult;
	resultConfirmHard: IQuizStringResult;
	resultAdditionalSup: IQuizeStringArrayResult;
	resultAdditionalBasic: IQuizeStringArrayResult;
	resultAdditionalHard: IQuizeStringArrayResult;
	resultDictation: IQuizeStringArrayResult[];
}

interface IActionsCtx extends IActionsBase {
	getData: () => IData;
	getResult: () => IQuizNumResult;
	gotoDirection: () => void;
	gotoNextBook: () => void;
	getReturnUsers: () => string[];
	clearReturnUsers: () => void;
	getReturnUsersForQuiz: () => string[];
	clearReturnUsersForQuiz: () => void;	
	getQnaReturns: () => IQnaReturn[];
	clearQnaReturns: () => void;
	init: () => void;
}

class TeacherContext extends TeacherContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;
	private _data!: IData;

	private _returnUsers: string[] = [];

	private _returnUsersForQuiz: string[] = [];
	private _qnaReturns: IQnaReturn[] = [];

	constructor() {
		super();

		this.state.hasPreview =  false;
		this.state.confirmBasicProg = SENDPROG.READY;
		this.state.confirmSupProg = SENDPROG.READY;
		this.state.confirmHardProg = SENDPROG.READY;
		this.state.additionalBasicProg = SENDPROG.READY;
		this.state.additionalSupProg = SENDPROG.READY;
		this.state.additionalHardProg = SENDPROG.READY;
		this.state.dictationProg = [SENDPROG.READY,SENDPROG.READY,SENDPROG.READY];
		this.state.scriptProg = [SENDPROG.READY,SENDPROG.READY,SENDPROG.READY];
		this.state.qnaProg = SENDPROG.READY;
		this.state.resultConfirmSup = {
			arrayOfCorrect: [],
			c1: [],
			c2: [],
			c3: [],
			uid: [],
			url: []
		};
		this.state.resultConfirmBasic = {
			arrayOfCorrect: [],
			c1: [],
			c2: [],
			c3: [],
			uid: [],
			url: []
		};
		this.state.resultConfirmHard = {
			c1: [],
			c2: [],
			c3: [],
			uid: [],
			url: []
		};
		this.state.resultAdditionalSup = {
			arrayOfCorrect: [],
			c0 : [],
			uid : [],
			url :[]
		};
		this.state.resultAdditionalBasic = {
			arrayOfCorrect: [],
			c0 : [],
			uid : [],
			url :[]
		};
		this.state.resultAdditionalHard = {
			arrayOfCorrect: [],
			c0 : [],
			uid : [],
			url :[]
		};
		this.state.resultDictation = [
			{
				arrayOfCorrect: [],
				c0 : [],
				uid : [],
				url :[]
			},
			{
				arrayOfCorrect: [],
				c0 : [],
				uid : [],
				url :[]
			},
			{
				arrayOfCorrect: [],
				c0 : [],
				uid : [],
				url :[]
			}
		];
		this.actions.init = () => {
			this.state.scriptProg = [SENDPROG.READY,SENDPROG.READY,SENDPROG.READY];
			this.state.qnaProg = SENDPROG.READY;
			this._returnUsers = [];
			if(this.state.confirmBasicProg < SENDPROG.COMPLETE) {
				this.state.confirmBasicProg = SENDPROG.READY;
				this._returnUsersForQuiz = [];
			}
		};

		this.actions.getData = () => this._data;
		this.actions.getResult = () => this.state.resultConfirmSup;
		this.actions.gotoDirection =  () => this._setViewDiv('direction');
		this.actions.gotoNextBook = () => felsocket.sendLauncher($SocketType.GOTO_NEXT_BOOK, null);
		this.actions.getReturnUsers = () => this._returnUsers;
		this.actions.clearReturnUsers = () => this._returnUsers = [];
		this.actions.getReturnUsersForQuiz = () => this._returnUsersForQuiz;
		this.actions.clearReturnUsersForQuiz = () => this._returnUsersForQuiz = [];
		this.actions.getQnaReturns = () => this._qnaReturns;
		this.actions.clearQnaReturns = () => {
			this._returnUsers = [];
			for(let i = 0; i < this._data.scripts[0].length; i++) {
				this._qnaReturns[i] = {num: 0, users: []};
			}
			this.actions.setRetCnt(0);
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

	public receive(messageFromPad: ISocketData) {
		super.receive(messageFromPad);
		if(messageFromPad.type === $SocketType.MSGTOTEACHER && messageFromPad.data) {
			const msg = (messageFromPad.data as  IIndexMsg);
			switch(msg.msgtype) {
				case 'confirm_return':
					if(this.state.confirmSupProg === SENDPROG.SENDED && msg.idx === 0) {
						const qmsg = msg as IQuizReturnMsg;
						let sidx = -1;
						for(let i = 0; i < App.students.length; i++) {
							if(App.students[i].id === qmsg.id) {
								sidx = i;
								break;
							}
						}
						const ridx = this.state.resultConfirmSup.uid.indexOf(qmsg.id);
						if(sidx >= 0 && ridx < 0) {
							const answers = [this._data.confirm_sup[0].problem1.answer,this._data.confirm_sup[0].problem2.answer,this._data.confirm_sup[0].problem3.answer];
							const ret = qmsg.returns;						// 사용자가 선택한 번호
							const result = this.state.resultConfirmSup;					// 결과 저장 	

							if(ret.answer1 === answers[0] && ret.answer2 === answers[1] && ret.answer3 === answers[2]) {
								result.arrayOfCorrect.push(true);
							} else result.arrayOfCorrect.push(false);
				
							result.c1.push(ret.answer1);
							result.c2.push(ret.answer2);
							result.c3.push(ret.answer3);
							result.url.push(qmsg.imgUrl);
							result.uid.push(qmsg.id);
							console.log(qmsg.imgUrl)
						}
					} else if(this.state.confirmBasicProg === SENDPROG.SENDED && msg.idx === 1) {
						const qmsg = msg as IQuizReturnMsg;
						let sidx = -1;
						for(let i = 0; i < App.students.length; i++) {
							if(App.students[i].id === qmsg.id) {
								sidx = i;
								break;
							}
						}
						const ridx = this.state.resultConfirmBasic.uid.indexOf(qmsg.id);
						if(sidx >= 0 && ridx < 0) {
							const answers = [this._data.confirm_nomal[0].item1.answer,this._data.confirm_nomal[0].item2.answer,this._data.confirm_nomal[0].item3.answer];
							const ret = qmsg.returns;						// 사용자가 선택한 번호
							const result = this.state.resultConfirmBasic;					// 결과 저장 	

							if(ret.answer1 === answers[0] && ret.answer2 === answers[1] && ret.answer3 === answers[2]) result.arrayOfCorrect.push(true);
							else result.arrayOfCorrect.push(false);
							result.c1.push(ret.answer1);
							result.c2.push(ret.answer2);
							result.c3.push(ret.answer3);
							result.url.push(qmsg.imgUrl);
							result.uid.push(qmsg.id);
						}
					} else if(this.state.confirmHardProg === SENDPROG.SENDED && msg.idx === 2) {
						const qmsg = msg as IQuizStringReturnMsg;
						let sidx = -1;
						for(let i = 0; i < App.students.length; i++) {
							if(App.students[i].id === qmsg.id) {
								sidx = i;
								break;
							}
						}
						const ridx = this.state.resultConfirmHard.uid.indexOf(qmsg.id);
						if(sidx >= 0 && ridx < 0) {
							const ret = qmsg.returns;
							const result = this.state.resultConfirmHard;
							result.c1.push(ret.answer1);
							result.c2.push(ret.answer2);
							result.c3.push(ret.answer3);
							result.url.push(qmsg.imgUrl);
							result.uid.push(qmsg.id);
							console.log('ddddd',result.url)
						}
					}
					break;				
				case 'additional_return':
					if(this.state.additionalSupProg === SENDPROG.SENDED && msg.idx === 0) {
						const qmsg = msg as IQuizReturnMsg;
						let sidx = -1;
						for(let i = 0; i < App.students.length; i++) {
							if(App.students[i].id === qmsg.id) {
								sidx = i;
								break;
							}
						}
						const ridx = this.state.resultAdditionalSup.uid.indexOf(qmsg.id);
						if(sidx >= 0 && ridx < 0) {
							const ret = qmsg.returns;						// 사용자가 선택한 번호
							const result = this.state.resultAdditionalSup;					// 결과 저장 
							
							let resultCorrect = true;
							for(let i = 0 ; i < this._data.additional_sup.length; i++) {
								result.c0[i] = {c1: [],c2: [],c3: [],uid: [], url:[]};
								const answers = [this._data.additional_sup[i].app_drops[0].correct,this._data.additional_sup[i].app_drops[1].correct,this._data.additional_sup[i].app_drops[2].correct];
								if(ret[i].answer1 !== answers[0] || ret[i].answer2 !== answers[1] || ret[i].answer3 !== answers[2]) resultCorrect = false;

								console.log('ret' , ret[i].answer1);
								console.log('answers' , answers);

								result.c0[i].c1.push(ret[i].answer1);
								result.c0[i].c2.push(ret[i].answer2);
								result.c0[i].c3.push(ret[i].answer3);
							}
							if(resultCorrect) result.arrayOfCorrect.push(true);
							else result.arrayOfCorrect.push(false);
							
							result.url.push(qmsg.imgUrl);
							result.uid.push(qmsg.id);
						}
					} else if(this.state.additionalBasicProg === SENDPROG.SENDED && msg.idx === 1) {
						const qmsg = msg as IQuizReturnMsg;
						let sidx = -1;
						for(let i = 0; i < App.students.length; i++) {
							if(App.students[i].id === qmsg.id) {
								sidx = i;
								break;
							}
						}
						const ridx = this.state.resultAdditionalBasic.uid.indexOf(qmsg.id);
						if(sidx >= 0 && ridx < 0) {
							const ret = qmsg.returns;						// 사용자가 선택한 번호
							const result = this.state.resultAdditionalBasic;					// 결과 저장 
							
							let resultCorrect = true;
							for(let i = 0 ; i < this._data.additional_basic.length; i++) {
								result.c0[i] = {c1: [],	c2: [],	c3: [],	uid: []	,url:[]};
								const answers = [this._data.additional_basic[i].sentence_answer1,this._data.additional_basic[i].sentence_answer2,this._data.additional_basic[i].sentence_answer3];
								if(ret[i].answer1 !== answers[0] || ret[i].answer2 !== answers[1] || ret[i].answer3 !== answers[2]) resultCorrect = false;
								console.log('ret' , ret[i]);
								console.log('answers' , answers);

								result.c0[i].c1.push(ret[i].answer1);
								result.c0[i].c2.push(ret[i].answer2);
								result.c0[i].c3.push(ret[i].answer3);
							}
							if(resultCorrect) result.arrayOfCorrect.push(true);
							else result.arrayOfCorrect.push(false);
							
							result.url.push(qmsg.imgUrl);
							result.uid.push(qmsg.id);
						}
					} else if(this.state.additionalHardProg === SENDPROG.SENDED && msg.idx === 2) {
						const qmsg = msg as IQuizReturnMsg;
						let sidx = -1;
						for(let i = 0; i < App.students.length; i++) {
							if(App.students[i].id === qmsg.id) {
								sidx = i;
								break;
							}
						}
						const ridx = this.state.resultAdditionalHard.uid.indexOf(qmsg.id);
						if(sidx >= 0 && ridx < 0) {
							const ret = qmsg.returns;						// 사용자가 선택한 번호
							const result = this.state.resultAdditionalHard;					// 결과 저장 
							
							let resultCorrect = true;
							for(let i = 0 ; i < this._data.additional_hard.length; i++) {
								result.c0[i] = {c1: [],	c2: [],	c3: [],	uid: [],url:[]	};
								const answers = [this._data.additional_hard[i].sentence1.answer1,this._data.additional_hard[i].sentence1.answer2];
								if(ret[i].answer1 !== answers[0] || ret[i].answer2 !== answers[1]) resultCorrect = false;
								console.log('ret' , ret[i]);
								console.log('answers' , answers);

								result.c0[i].c1.push(ret[i].answer1);
								result.c0[i].c2.push(ret[i].answer2);
							}
							if(resultCorrect) result.arrayOfCorrect.push(true);
							else result.arrayOfCorrect.push(false);
							
							result.url.push(qmsg.imgUrl);
							result.uid.push(qmsg.id);
						}
					}
					break;				
				case 'dictation_return':
					if(this.state.dictationProg[msg.idx] === SENDPROG.SENDED) {
						const qmsg = msg as IQuizReturnMsg;
						let sidx = -1;
						for(let i = 0; i < App.students.length; i++) {
							if(App.students[i].id === qmsg.id) {
								sidx = i;
								break;
							}
						}
						const ridx = this.state.resultDictation[msg.idx].uid.indexOf(qmsg.id);
						const dic_data_array = [this._data.dictation_sup,this._data.dictation_basic,this._data.dictation_hard];
						if(sidx >= 0 && ridx < 0) {
							const ret = qmsg.returns;						// 사용자가 선택한 번호
							const result = this.state.resultDictation[msg.idx];					// 결과 저장 
							
							let resultCorrect = true;
							for(let i = 0 ; i < dic_data_array[msg.idx].length; i++) {
								result.c0[i] = {c1: [],	c2: [],	c3: [],	uid: [],url:[] };
								const dic_data = dic_data_array[msg.idx][i];
								const answers = [dic_data.sentence1.answer1,dic_data.sentence2.answer1,dic_data.sentence3.answer1];
								if(ret[i].answer1 !== answers[0] || ret[i].answer2 !== answers[1] || ret[i].answer3 !== answers[2]) resultCorrect = false;
								console.log('ret' , ret[i]);
								console.log('answers' , answers);

								result.c0[i].c1.push(ret[i].answer1);
								result.c0[i].c2.push(ret[i].answer2);
								result.c0[i].c3.push(ret[i].answer3);
							}
							if(resultCorrect) result.arrayOfCorrect.push(true);
							else result.arrayOfCorrect.push(false);
							
							result.url.push(qmsg.imgUrl);
							result.uid.push(qmsg.id);
						}
					}
					break;		
				case 'qna_return' :
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
						
						let ans_submit = 'qna;';
						const scripts = this._data.scripts[msg.idx];
						if( qmsg.returns.length > 0) {
							qmsg.returns.forEach((val,idx) => {
								const script = scripts[val];
								if(script) {
									if(ans_submit === 'qna;') ans_submit += script.seq + '|' + script.dms_eng;
									else ans_submit += '§' + script.seq + '|' + script.dms_eng;
								}
							});
						}
					}
					break;		
				default:
					break;
			}
		}
	}
	
	public async setData(data: any) {
		this._data = initData(data);
		this.state.hasPreview = true;
		const dicdata_array = [this._data.dictation_sup,this._data.dictation_basic,this._data.dictation_hard];
		for(let i = 0 ; i < this._data.additional_sup.length; i++) {
			this.state.resultAdditionalSup.c0[i] = {c1: [],	c2: [],c3: [],uid: [],url:[]};
		}
		for(let i = 0 ; i < this._data.additional_basic.length; i++) {
			this.state.resultAdditionalBasic.c0[i] = {c1: [], c2: [],c3: [],uid: [],url:[]};
		}	
		for(let i = 0 ; i < this._data.additional_hard.length; i++) {
			this.state.resultAdditionalHard.c0[i] = {c1: [], c2: [],c3: [],uid: [],url:[]};
		}
		dicdata_array.map((dic_data: any, idx) => {
			for(let i = 0 ; i < dic_data.length ; i++) {
				this.state.resultDictation[idx].c0[i] = {c1: [], c2: [],c3: [],uid: [],url:[]};
			}
		});

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

		const scripts = this._data.scripts;
		const speakerA = this._data.role_play.speakerA.name;
		const speakerB = this._data.role_play.speakerB.name;
		const speakerC = this._data.role_play.speakerC.name;

		if(!this._data.role_play.speakerD) {
			this._data.role_play.speakerD = {
				name: '',
				image_s: '',
				image_l: '',
			};
		}
		if(!this._data.role_play.speakerE) {
			this._data.role_play.speakerE = {
				name: '',
				image_s: '',
				image_l: '',
			};
		}
		const speakerD = this._data.role_play.speakerD.name;
		const speakerE = this._data.role_play.speakerE.name;

		
		const previewMsg: IPreviewClassMsg[] = [];

		scripts.map((item,idx) =>{
			for(let i = 0; i < item.length; i++) {
				const script = item[i];
				if(script.speaker === speakerA) script.roll = 'A';
				else if (script.speaker === speakerB) script.roll = 'B';
				else if (script.speaker === speakerC) script.roll = 'C';
				else if (script.speaker === speakerD) script.roll = 'D';
				else script.roll = 'E';
	
				this._qnaReturns[i] = {num: 0, users: []};
			}
		})
		
	
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
	IQuizNumResult,
	IQuizStringResult
};