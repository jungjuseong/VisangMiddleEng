import * as React from 'react';

import * as _ from 'lodash';
import { observable, action } from 'mobx';
import { App } from '../../App';
import * as felsocket from '../../felsocket';
import * as kutil from '@common/util/kutil';
import * as StrUtil from '@common/util/StrUtil';
import { initData, TypeQuiz, IWordData, IData, IMsg, IRecordedMsg, ISpellingReturnMsg } from '../common';
import { TeacherContextBase, VIEWDIV, IStateBase, IActionsBase } from '../../share/tcontext';

export type TProg = 'direction'|'list'|'quiz-select'|'grouping'|'timer'|'board'|'quiz';

/** 싱글 퀴즈에서 결과 저장 인터페이스 */
interface ISingleResult extends IQuizSingleResult {
	quizType: TypeQuiz;
}

/** 1View 사전학습 데이터 관련 인터페이스 */
interface IValArr {
	average: number;
	count: number;
	sum: number;
	txt: string;
}

/**
 * 싱글 결과물을 복제
 * @param {ISingleResult} obj - 복제될 소스
 * @return {ISingleResult} - 복제 결과물
 */
function _cloneSingleResult(singleResult: ISingleResult) {
	const cloned: ISingleResult = {
		questions: [],
		users: [],
		quizTime: 0,
		quizType: '',
	};
	singleResult.questions.forEach((val, idx) => cloned.questions[idx] = {...val});
	singleResult.users.forEach((val, idx) => cloned.users[idx] = {...val});
	
	return {
		...cloned,
		quizTime: singleResult.quizTime,
		questioType: singleResult.quizType,
	};
}

/** 팀형식 퀴즈 결과물 인터페이스 */
interface IGroupResult extends IQuizGroupResult {
	quizType: TypeQuiz;
}

/**
 * 팀 결과물을 복제
 * @param {IGroupResult} groupResult - 복제될 소스
 * @return {IGroupResult} - 복제 결과물
 */
function _cloneGroupResult(groupResult: IGroupResult) {
	const cloned: IGroupResult = {
		ga_point: groupResult.ga_point,
		na_point: groupResult.na_point,
		questions: [],
		users: [],
		quizTime: 0,
		quizType: '',
	};
	
	groupResult.questions.forEach((item, idx) => cloned.questions[idx] = {...item});
	groupResult.users.forEach((item, idx) => cloned.users[idx] = {...item});
	
	return {
		...cloned,
		quizTime: groupResult.quizTime,
		quizType: groupResult.quizType,
	}
}

/** 글로벌 상태 */
interface IStateCtx extends IStateBase {
	/** 현재 상태 
	 * 'direction' - 간지 페이지
	 * 'list' - 어휘 리스트 페이지
	 * 'quiz-select' - 퀴즈 형식및 싱글/팀 선택
	 * 'grouping' - 팀 퀴즈에서 학생 분류 
	 * 'timer' - 문제수/시간 설정
	 * 'board' - 팀 퀴즈에서 룰렛
	 * 'quiz' - 문제및 결과
	*/ 
	prog: TProg;
	/** 퀴즈 상태
	 * 'quiz' - 퀴즈 (사운드 재생포함)
	 * 'wait-result' - 타이머 종료시 학생들 결과 return을 기다리고 있는 상태
	 * 'result'	- 결과 표시 
	*/
	quizProg: TypeQuizProg;
	/** 퀴즈 형식  */
	quizType: TypeQuiz;
	/** 퀴즈 팀/싱글 여부 */
	isGroup: boolean;
	/** 사전 학습 결과가 있는지 여부 */
	hasPreview: boolean;
	/** 학습 speak에서 오디오 녹음 상태 */
	speak_audio: boolean;
	/** 학습 speak에서 비디오 녹음 상태 */
	speak_video: boolean;

	/** drill popup speaking에서 오디오 녹음 상태 */
	speaking_audio: boolean;
	/** drill popup speaking에서 비디오 녹음 상태 */
	speaking_video: boolean;

	/** 팀 A 학생들 */
	gas: IStudent[];
	/** 팀 B 학생들 */
	nas: IStudent[];
	/** 퀴즈에서 학생들 return 수, 한 문제 시작시 리셋  */
    numOfReturn: number;    
    returnUsers: string[];
}

/** 글로벌 액션 */
interface IActionsCtx extends IActionsBase {
	/** @returns {IWordData[]} 전체 어휘 array  */
	getWords: () => IWordData[];
	/** timer에서 설정된 문제및 시간 팀여부 셋팅
	 * @param {number[]} idxs - 문제들 인덱스 array
	 * @param {number} qtime - 제한시간
	 * @param {boolean} isGroup - 팀-싱글 여부
	*/
	setQuizInfo: (idxs:  number[], qtime: number, isGroup: boolean) => void;
	
	getGroupInfo: () => IGroupResult;
	getSingleInfo: () => ISingleResult;

	waitResult: () => void;
	prepareGroupResult: () => void;
	prepareSingleResult: () => void;

	getQuizResult: (type: TypeQuiz) => { single: ISingleResult|null, group: IGroupResult|null};
	gotoQuizResult: (type: TypeQuiz, isGroup: boolean) => boolean;
	gotoQuizSelect: () => void;

	setQIdx: (idx: number) => void;
	setQuizProg: (prog: TypeQuizProg) => void;
}

interface IBothResult {
	single: ISingleResult|null;
	group: IGroupResult|null;
}

class TeacherContext extends TeacherContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;
	private _data!: IData;
	private _qidx: number = 0;

	private _sound_result: IBothResult;
	private _meaning_result: IBothResult;
	private _spelling_reult: IBothResult;
	private _sentence_result: IBothResult;

	private _single_result: ISingleResult = {
		questions: [],
		users: [],
		quizTime: 0,
		quizType: '',
	};

	private _group_result: IGroupResult = {
		questions: [],
		users: [],
		ga_point: 0,
		na_point: 0,
		quizTime: 0,
		quizType: '',
	};

	constructor() {
		super();

		this.state = {
			...this.state,
			prog: 'direction',
			quizType: '',
			isGroup: false,
			quizProg: '',
			speak_audio: false,
			speak_video: false,	
			speaking_audio: false,
			speaking_video: false,	
			gas: [],
			nas: [],
			returnUsers: [],
		}
		this._sound_result = {single: null, group: null};
		this._meaning_result = {single: null, group: null};
		this._spelling_reult = {single: null, group: null};
		this._sentence_result = {single: null, group: null};
		
		this.actions.getWords = () => this._data.page1.words;

		this.actions.setQuizInfo = (idxs:  number[], qtime: number, isGroup: boolean) => {
			const words = this._data.page1.words;
			let userResult: IUserResult[];
			if(isGroup) {
				const { questions, users } = this._group_result;
				userResult = users;
				while(questions.length > 0) questions.pop();	
				this._group_result = {
					...this._group_result,
					ga_point: 0,
					na_point: 0,
					quizTime: qtime,
					quizType: this.state.quizType,
				}
				idxs.forEach((val, idx) => {
					questions[idx] = {
							qidx: val,
							point: 0,
							ga_correct: 0,
							na_correct: 0,
							returnUsers: [],
						};
				});
			} else {
				const { questions, users } = this._single_result;
				userResult = users;
				while(questions.length > 0) questions.pop();				

				this._single_result.quizTime = qtime;
				this._single_result.quizType = this.state.quizType;

				const qtype = this.state.quizType;
				const hasPreview = this.state.hasPreview;
				idxs.forEach((val, idx) => {
					const word = words[val];
					let preview = 0;
					if(hasPreview) {
						switch(qtype) {
						case 'sound': preview = word.app_sound;break;
						case 'meaning': preview = word.app_meaning; break;
						case 'spelling': preview = word.app_spelling; break;
						case 'usage': preview = word.app_sentence; break;				
						default:
							break;
						}
					}
					questions[idx] = {
						qidx: val,
						numOfCorrect: 0,
						name: word.entry,
						preview,
					};
				});
			} 
			while(userResult.length > 0) userResult.pop();

			if(idxs.length > 0) {
				App.students.forEach((student, idx) => {
					const result: boolean[] = [];
					const inputs: string[] = [];
					const stimes: string[] = [];
					const etimes: string[] = [];
					idxs.forEach((val, aidx) => {
						result[aidx] = false;
						inputs[aidx] = '';
						stimes[aidx] = '';
						etimes[aidx] = '';
					});	
					let ga_na: undefined | 'ga' | 'na';
					if(isGroup) {
						let find = _.findIndex(this.state.nas, {id: student.id});
						if(find < 0) ga_na = 'ga';
						else ga_na = 'na';
					}
					userResult[idx] = {
						id: student.id,
						result,
						inputs,
						stimes,
						etimes,
						name: student.name,
						numOfCorrect: 0,
						ga_na,
						grade: 0,
					};
				});
			} else {
				this.actions.setQuizProg('');
				while(this.state.gas.length > 0) this.state.gas.pop();
				while(this.state.nas.length > 0) this.state.nas.pop();
			}
			this.state.numOfReturn = 0;
			this.state.isGroup = isGroup;
		};
		this.actions.getGroupInfo = () => this._group_result;
		this.actions.getSingleInfo = () => this._single_result;

		this.actions.waitResult = async () => {
			// console.log('this.actions.waitResult this.state.quizProg=' + this.state.quizProg);
			
			const { quizProg } = this.state;

			if(quizProg !== 'quiz') return;

			this.actions.setQuizProg('wait-result');
			await kutil.wait(5000);

			if(this.state.quizProg !== 'wait-result') return;
			this.actions.prepareSingleResult();
			this.actions.setQuizProg('result');
		};

		const prepareUserResult = (users: IUserResult[]) => {
			users.forEach((user, idx) => {
				let numOfCorrect = 0;
				user.result.forEach((isCorrect) => {
					if(isCorrect) numOfCorrect++;
				});
				user.numOfCorrect = numOfCorrect;
			});
			let arr = users.sort((a, b) => {
				if(a.numOfCorrect > b.numOfCorrect) return -1;
				else if(a.numOfCorrect < b.numOfCorrect) return 1;
				else return 0;
			});

			// while(users.length > 0) users.pop();
			let grade: number = 0;
			let prevCnt: number = -1;
			arr.forEach((user, idx) => {
				if (prevCnt !== user.numOfCorrect) {
					grade++;
				}
				user.grade = grade;
				prevCnt = user.numOfCorrect;

				users[idx] = user;
			});		
		};

		this.actions.prepareGroupResult = () => {
			const {users, questions} = this._group_result;
			prepareUserResult(users);

			switch(this.state.quizType) {
				case 'sound': 
					this._sound_result.group = _cloneGroupResult(this._group_result);
					break;
				case 'meaning': 
					this._meaning_result.group = _cloneGroupResult(this._group_result);
					break;
				case 'spelling': 
					this._spelling_reult.group = _cloneGroupResult(this._group_result);
					break;
				case 'usage': 
					this._sentence_result.group = _cloneGroupResult(this._group_result);
					break;
				default: break;
			}
			this._uploadInclassReport(users, questions);
		
		};

		this.actions.prepareSingleResult = () => {
			const {users, questions} = this._single_result;
			prepareUserResult(users);

			switch(this.state.quizType) {
			case 'sound': 
				this._sound_result.single = _cloneSingleResult(this._single_result);
				break;
			case 'meaning': 
				this._meaning_result.single = _cloneSingleResult(this._single_result);
				break;
			case 'spelling': 
				this._spelling_reult.single = _cloneSingleResult(this._single_result);
				break;
			case 'usage': 
				this._sentence_result.single = _cloneSingleResult(this._single_result);
				break;
			default: break;
			}

			this._uploadInclassReport(users, questions);
			// console.log(this._r_single.users);
		};

		this.actions.getQuizResult = (type: TypeQuiz) => {
			switch(type) {
			case 'sound': return this._sound_result;
			case 'meaning': return this._meaning_result;
			case 'spelling': return this._spelling_reult;
			case 'usage': return this._sentence_result;
			default: return {single: null, group: null,};
			}
		};

		this.actions.gotoQuizResult = (type: TypeQuiz, isGroup: boolean) => {
			let ret = false;
			let result: {single: ISingleResult|null, group: IGroupResult|null}|null = null;
			switch(type) {
				case 'sound': result = this._sound_result; break;
				case 'meaning': result = this._meaning_result; break;
				case 'spelling': result = this._spelling_reult; break;
				case 'usage': result = this._sentence_result; break;
				default: break;
			}
			
			let qtype: TypeQuiz = '';
			if(result) {
				if(isGroup && result.group) {
					while(this.state.gas.length > 0) this.state.gas.pop();
					while(this.state.nas.length > 0) this.state.nas.pop();
					this._group_result = _cloneGroupResult(result.group);

					const students = App.students;
					const users = this._group_result.users;
					for(const u of users) {
						const s = _.find(students, {id: u.id});
						if(u.ga_na === 'ga' && s) {
							this.state.gas.push(s);
						} else if(u.ga_na === 'na' && s) {
							this.state.nas.push(s);
						}
					}
					qtype = this._group_result.quizType;
					ret = true;
				} else if(!isGroup && result.single) {
					while(this.state.gas.length > 0) this.state.gas.pop();
					while(this.state.nas.length > 0) this.state.nas.pop();
					this._single_result = _cloneSingleResult(result.single);
					
					qtype = this._single_result.quizType;
					ret = true;
				}
			}
			if(ret) {
				this.state.quizType = qtype;
				this.actions.setQuizProg('result');
				this.state.isGroup = isGroup;
				this.state.prog = 'quiz';			
			}
			return ret;	
		};


		this.actions.gotoQuizSelect = () => {
			this.state.prog = 'quiz-select';
			/*
			await kutil.wait(3000);
			// console.log('reset');
			if(this.state.prog === 'quiz-select') this._reset();
			*/
		};
		this.actions.setQIdx = (idx: number) => {
			
			const questionLength = (this.state.isGroup) ? this._group_result.questions.length : 0
			if(idx < 0 || idx >= questionLength) return;

			this._qidx = idx;
			this.state.numOfReturn = 0;
		};
		this.actions.setQuizProg = (prog: TypeQuizProg) => {
			this.state.quizProg = prog;
		};
	}

	private _reset() {
		this.actions.setQuizProg('');

		this.state = {
			...this.state,
			quizType: '',
			speak_audio: false,
			speak_video: false,
			speaking_audio: false,
			speaking_video: false,
			numOfReturn: 0,
		}

		while(this.state.gas.length > 0) this.state.gas.pop();
		while(this.state.nas.length > 0) this.state.nas.pop();
		while(this.state.returnUsers.length > 0) this.state.returnUsers.pop();
	}

	private _uploadInclassReport(users: IUserResult[], questions: Array<{qidx: number,}>) {
		
		const userReports: IInClassReport[] = [];
		questions.forEach((q, idx) => {
			const word = this._data.page1.words[q.qidx];
			if(word) {
				let studyProps: IInClassStudyProps|undefined;
				let ans_correct: string|undefined;
				switch(this.state.quizType) {
					case 'sound':
						studyProps = word.quiz_sound;
						ans_correct = word.quiz_sound.correct.toString();
						break;
					case 'meaning': 
						studyProps = word.quiz_meaning;
						ans_correct = word.quiz_meaning.correct.toString();
						break;
					case 'spelling': 
						studyProps = word.quiz_spelling;
						ans_correct = word.quiz_spelling ? word.quiz_spelling.entry : undefined;
						break;
					case 'usage': 
						studyProps = word.quiz_usage;
						ans_correct = word.quiz_usage.correct.toString();
						break;
					default: break;
				}
				if(studyProps && studyProps.tmq_seq) {
					users.forEach((user, uidx) => {
						studyProps = studyProps!;
						studyProps.tmq_seq = studyProps.tmq_seq!;
						ans_correct = ans_correct!;
						userReports.push({
							std_cont_seq: studyProps.tmq_seq,
							studentId: user.id,
							ans_tf: user.result[idx] ? '1' : '0',
							ans_submit: user.inputs[idx] ? user.inputs[idx] : '',
							ans_starttime: user.stimes[idx] ? user.stimes[idx] : '',
							ans_endtime: user.etimes[idx] ? user.etimes[idx] : '',
							sc_div1: studyProps.SC_DIV1 ? studyProps.SC_DIV1 : '',
							sc_div2: studyProps.SC_DIV2 ? studyProps.SC_DIV2 : '',
							sc_div3: studyProps.SC_DIV3 ? studyProps.SC_DIV3 : '',
							sc_div4: studyProps.SC_DIV4 ? studyProps.SC_DIV4 : '',
							files: null,
							ans_correct,
							tab_index: ''
						});				
					});
				}
			}
		});
		if(userReports.length > 0) {
            console.log('inclassReport(LogFromContentTeacher): ', userReports); // 비상요청 사항                        
            felsocket.uploadInclassReport(userReports);
        }
	}

	@action protected _setViewDiv(viewDiv: VIEWDIV) {
		super._setViewDiv(viewDiv);
		if(viewDiv === 'direction') {
			this.state.prog = 'direction';
		} else {
			this.state.prog = 'list';
		}
		this._reset();
	}

	public receive(data: ISocketData) {
		super.receive(data);
		if(data.type === $SocketType.MSGTOTEACHER && data.data) {
			const msg = data.data as IMsg;
			if(msg.msgtype === 'quiz_result') {
				if(this.state.prog !== 'quiz' && this.state.prog !== 'board') return;
				
				const qmsg = msg as IQuizResultMsg;
				if(this.state.isGroup) {
					const { questions, users } = this._group_result;
					if(qmsg.idx >= 0 && qmsg.idx < questions.length) {
						const user = _.find(users, {id: qmsg.id});
						if(user) {
							if(qmsg.idx >= 0 && qmsg.idx < user.result.length) {
								user.result[qmsg.idx] = qmsg.result;
								user.inputs[qmsg.idx] = qmsg.input;
								user.stimes[qmsg.idx] = qmsg.stime;
								user.etimes[qmsg.idx] = qmsg.etime;
							}
						}
						let ga_correct = 0;
						let na_correct = 0;
						for(const u of users) {
							if(u.result[qmsg.idx]) {
								if(u.ga_na === 'na') na_correct++;
								else ga_correct++;
							}
						}
						questions[qmsg.idx].ga_correct = ga_correct;
						questions[qmsg.idx].na_correct = na_correct;

						if(qmsg.idx === this._qidx) {
							this.state.numOfReturn++;
						}
					}
				} else {
					const { questions, users } = this._single_result;
					if(qmsg.idx >= 0 && qmsg.idx < questions.length) {
						const user = _.find(users, {id: qmsg.id});
						if(user) {
							if(qmsg.idx >= 0 && qmsg.idx < user.result.length) {
								user.result[qmsg.idx] = qmsg.result;
								user.inputs[qmsg.idx] = qmsg.input;
								user.stimes[qmsg.idx] = qmsg.stime;
								user.etimes[qmsg.idx] = qmsg.etime;
							}
						}
						let numOfCorrect = 0;
						for(const u of users) {
							if(u.result[qmsg.idx]) numOfCorrect++;
						}
						questions[qmsg.idx].numOfCorrect = numOfCorrect;


						if(qmsg.idx === this._qidx) {
							let tmp = this.state.numOfReturn + 1;
							if(
								this._qidx === questions.length - 1 &&
								tmp === users.length
							) {
								this.actions.prepareSingleResult();
								
								if(this.state.quizProg === 'wait-result') {
									this.actions.setQuizProg('result');
								} else if(this.state.quizProg === 'quiz') {
									(async () => {
										await kutil.wait(100);
										let quizProg = this.state.quizProg;
										if(quizProg === 'quiz') this.actions.setQuizProg('wait-result');
										else if(quizProg !== 'wait-result') return;

										await kutil.wait(600);
										quizProg = this.state.quizProg;
										if(quizProg !== 'wait-result') return;

										this.actions.setQuizProg('result');
									})();
								}
							}
							this.state.numOfReturn = tmp;
						}
					}					
				}
				
				// console.log('this.state.quizProp=' + this.state.quizProg, 'this.state.numOfReturn=' + this.state.numOfReturn);
			} else if(msg.msgtype === 'recorded_return') {
				if(this.state.prog === 'list' && 
					(this.state.speak_video || this.state.speak_audio || this.state.speaking_audio || this.state.speaking_video)
				) { 
					this.actions.setRetCnt(this.state.retCnt + 1);

					const rmsg = msg as IRecordedMsg;
					const word = _.find(this._data.page1.words, {idx: rmsg.word_idx});
					if(!word) return;

					let ans_submit = '';
					let tab_index = '';
					if(this.state.speak_video) {
						ans_submit = 'vid;' + word.entry; 
						tab_index = '1';
					} else if (this.state.speak_audio ) {
						ans_submit = 'aud;' + word.entry; 
						tab_index = '2';
					} else if(this.state.speaking_video) {
						ans_submit = 'vid;' + word.entry; 
						tab_index = '11';
					} else if (this.state.speaking_audio) {
						ans_submit = 'aud;' + word.entry; 
						tab_index = '12';
					} 
					
					let files: string[] = [];
					files.push(rmsg.url);
	
					const stime = StrUtil._toStringTimestamp(new Date(rmsg.stime));
					const etime = StrUtil._toStringTimestamp(new Date(rmsg.etime));
	
					let userReports: IInClassReport[] = [];
					userReports.push({
						std_cont_seq: 0,
						studentId: rmsg.id,
						ans_tf: '1',
						ans_submit,
						ans_starttime: stime ? stime : '',
						ans_endtime: etime ? etime : '',
						sc_div1: '',
						sc_div2: '',
						sc_div3: '',
						sc_div4: '',
						files,
						ans_correct: word.entry,
						tab_index,
					});	
					if(userReports.length > 0) {
                        console.log('inclassReport(LogFromContentTeacher): ', userReports); // 비상요청 사항                        
                        felsocket.uploadInclassReport(userReports);
                    }
				} 
			} else if(msg.msgtype === 'spelling_return') {
				const rmsg = msg as ISpellingReturnMsg;
				const ridx = this.state.returnUsers.indexOf(rmsg.id);
				if(ridx < 0) {
                    this.state.returnUsers.push(rmsg.id);
                    felsocket.addStudentForStudentReportType6(rmsg.id);
                    this.actions.setRetCnt(this.state.returnUsers.length);
				}
				
				const word = _.find(this._data.page1.words, {idx: rmsg.word_idx});
				if(!word) return;

				const ans_submit = 'typ;' + rmsg.user_input; 
				const tab_index = '4';

				const stime = StrUtil._toStringTimestamp(new Date(rmsg.stime));
				const etime = StrUtil._toStringTimestamp(new Date(rmsg.etime));

				let userReports: IInClassReport[] = [];
				userReports.push({
					std_cont_seq: 0,
					studentId: rmsg.id,
					ans_tf: '1',
					ans_submit,
					ans_starttime: stime ? stime : '',
					ans_endtime: etime ? etime : '',
					sc_div1: '',
					sc_div2: '',
					sc_div3: '',
					sc_div4: '',
					files: null,
					ans_correct: word.entry,
					tab_index,
				});	
				if(userReports.length > 0) {
					console.log('inclassReport(LogFromContentTeacher): ', userReports); // 비상요청 사항
					felsocket.uploadInclassReport(userReports);
                }
			}
		}
	}

	public async setData(data: IData) {
		data = initData(data);

		this._data = data;
		this.state.hasPreview = true;
		const words = data.page1.words;
	
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
		}// 사전 학습 관련 데이터 셋팅 을 위한 함수 
		
		const previewMsg: IPreviewClassMsg[] = [];

		for(let i = 0; i < words.length; i++) {
			const word = words[i];
			word.app_idx = i;
			word.app_checked = false;
			word.app_studied = false;
			word.app_result = false;

			if(!App.isDvlp && word.tmq_COD && word.tmq_COD[0] !== undefined) {
				previewMsg.push({evalCode: '1',vsFromData: word.tmq_COD[0].codType,vsFromSeq: Number(word.tmq_COD[0].codSeq)});				
			}			
		}

		console.log('previewMsg~~~', previewMsg.length, previewMsg);

		if(!App.isDvlp && App.lang === 'ko') {
			const previewResult =  await felsocket.getPreviewResultClass(previewMsg);

			if(previewResult.length > 0) {			
				const sound_result = previewResult.filter((item,idx) => item.mttSeq === 6);
				const meaning_result = previewResult.filter((item,idx) => item.mttSeq === 7);
				const spelling_result = previewResult.filter((item,idx) => item.mttSeq === 8);
				const usage_result = previewResult.filter((item,idx) => item.mttSeq === 9);

				let soundTextList: string[] = [];
				let soundValues: IValArr[] = [];
		
				let spellingTextList: string[] = [];
				let spellingValues: IValArr[] = [];
		
				let meaningTextList: string[] = [];
				let meaningValues: IValArr[] = [];
		
				let usageTextList: string[] = [];
				let usageValues: IValArr[] = [];

				_initAvgPercent(soundTextList, soundValues, sound_result);
				_initAvgPercent(spellingTextList, spellingValues, spelling_result);
				_initAvgPercent(meaningTextList, meaningValues, meaning_result);
				_initAvgPercent(usageTextList, usageValues, usage_result);

				soundValues.forEach(value => {
					let idx = words.findIndex(item => item.entry === value.txt);
					words[idx].app_sound = value.average;
				});

				spellingValues.forEach(value => {
					let idx = words.findIndex(item => item.entry === value.txt);
					words[idx].app_spelling = value.average;
				});

				meaningValues.forEach(value => {
					let idx = words.findIndex(item => item.entry === value.txt);
					words[idx].app_meaning = value.average;
				});

				usageValues.forEach(value => {
					let idx = words.findIndex(item => item.entry === value.txt);
					words[idx].app_sentence = value.average;
				});
			} else {
				for(let i = 0; i < words.length; i++) {
					words[i].app_sound = -1;
					words[i].app_meaning = -1;
					words[i].app_spelling = -1;
					words[i].app_sentence = -1;
				}
			}
		} else {// 개발자 모드이거나 국내 런처가 아닌경우
			for(let i = 0; i < words.length; i++) {
				const word = words[i];
				const test_sound = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
				const test_meaning = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
				const test_spelling = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
				const test_sentence = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
				word.app_sound = test_sound[i];
				word.app_meaning = test_meaning[i];
				word.app_spelling = test_spelling[i];
				word.app_sentence = test_sentence[i];
			}
		}
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
};