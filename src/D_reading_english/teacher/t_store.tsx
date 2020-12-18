import * as React from 'react';
import * as _ from 'lodash';
import { observable, action } from 'mobx';
import * as felsocket from '../../felsocket';

import { initData,IMsg,IScript,IWarmupReturn,IData,IWarmupReturnMsg,IQuizReturnMsg,IQNAMsg,IGraphMsg,IGraphSheetMsg } from '../common';
import { TeacherContextBase, VIEWDIV, IStateBase, IActionsBase } from '../../share/tcontext';
import * as StrUtil from '@common/util/StrUtil';

type BTN_DISABLE = ''|'all'|'ex_video';

const enum SENDPROG {
	READY,
	SENDING,
	SENDED,
	COMPLETE,
}

interface IStateCtx extends IStateBase {
	videoPopup: boolean;
	viewStoryBook: boolean;
	viewAdditionalQuiz:boolean;
	warmup_returns: IWarmupReturn[][];
	isNaviBack: boolean;
	isVideoStudied: boolean;
}

interface IActionsCtx extends IActionsBase {
	getData: () => IData;
	gotoDirection: () => void;
	gotoNextBook: () => void;
	setWarmupFnc: (fnc: ((msg: IWarmupReturnMsg) => void)|null) => void;
	setQuestionFnc: (fnc: ((msg: IQuizReturnMsg) => void)|null) => void;
	setQNAFnc: (fnc: ((msg: IQNAMsg) => void)|null) => void;

    setGraphFnc: (fnc: ((msg: IGraphMsg) => void)|null) => void;
    setGraphSheetFnc: (fnc: ((msg: IGraphSheetMsg) => void)|null) => void;

    setSummaryFnc: (fnc: ((msg: IQuizReturnMsg) => void)|null) => void;
    setCheckupFnc: (fnc: ((msg: IQNAMsg) => void)|null) => void;
}

class TeacherContext extends TeacherContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;

	private _data!: IData;

	private _warmupFnc: ((msg: IWarmupReturnMsg) => void)|null = null;
	private _questionFnc: ((msg: IQuizReturnMsg) => void)|null = null;
	private _qnaFnc: ((msg: IQNAMsg) => void)|null = null;
    private _graphFnc: ((msg: IGraphMsg) => void)|null = null;
    private _graphSheetFnc: ((msg: IGraphSheetMsg) => void)|null = null;

	private _summaryFnc: ((msg: IQuizReturnMsg) => void)|null = null;
    private _checkupFnc: ((msg: IQNAMsg) => void)|null = null;

	constructor() {
		super();
		this.state.videoPopup = false;
		this.state.viewStoryBook = false;
		this.state.warmup_returns = [];
		this.state.isNaviBack = false;
		this.state.isVideoStudied = false;
		this.actions.getData = () => this._data;
		this.actions.gotoDirection = () => this._setViewDiv('direction');
		this.actions.gotoNextBook = () => {
			felsocket.sendLauncher($SocketType.GOTO_NEXT_BOOK, null);
		};

		this.actions.setWarmupFnc = (fnc: ((msg: IWarmupReturnMsg) => void)|null) => {
			this._warmupFnc = fnc;
		};
		this.actions.setQuestionFnc = (fnc: ((msg: IQuizReturnMsg) => void)|null) => {
			this._questionFnc = fnc;
		};
		this.actions.setQNAFnc = (fnc: ((msg: IQNAMsg) => void)|null) => {
			this._qnaFnc = fnc;
		};
		this.actions.setGraphFnc = (fnc: ((msg: IGraphMsg) => void)|null) => {
			this._graphFnc = fnc;
		};
		this.actions.setGraphSheetFnc = (fnc: ((msg: IGraphSheetMsg) => void)|null) => {
			this._graphSheetFnc = fnc;
		};
		this.actions.setSummaryFnc = (fnc: ((msg: IQuizReturnMsg) => void)|null) => {
			this._summaryFnc = fnc;
		};
		this.actions.setCheckupFnc = (fnc: ((msg: IQNAMsg) => void)|null) => {
			this._checkupFnc = fnc;
		};
	}	

	@action protected _setViewDiv(viewDiv: VIEWDIV) {
		if(viewDiv !== this.state.viewDiv) {
			this.state.videoPopup = false;	
			this.state.viewStoryBook = false;	
		}
		super._setViewDiv(viewDiv);
	}
	private _uploadInclassReport = (qmsg: IQuizReturnMsg) => {
		const questions = this._data.question;

		const userReports: IInClassReport[] = [];

		questions.forEach((question, idx) => {
			const ret = qmsg.returns[idx];
			const stime = StrUtil._toStringTimestamp(new Date(ret.stime));
			const etime = StrUtil._toStringTimestamp(new Date(ret.etime));
			if(ret && question.tmq_seq) {
				userReports.push({
					std_cont_seq: question.tmq_seq,
					studentId: qmsg.id,
					ans_tf: ret.answer === question.answer ? '1' : '0',
					ans_submit: '' + ret.answer,
					ans_starttime: stime,
					ans_endtime: etime,
					sc_div1: question.SC_DIV1 ? question.SC_DIV1 : '',
					sc_div2: question.SC_DIV2 ? question.SC_DIV2 : '',
					sc_div3: question.SC_DIV3 ? question.SC_DIV3 : '',
					sc_div4: question.SC_DIV4 ? question.SC_DIV4 : '',
					files: null,
					ans_correct: '' + question.answer,
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
		if(data.type === $SocketType.MSGTOTEACHER && data.data) {
			const msg = data.data as IMsg;
			
			let files: string[]|null = null;
			let userReports: IInClassReport[] = [];
			let stime;
			let etime;
			
			if(msg.msgtype === 'warmup_return') {
				const wmsg = msg as IWarmupReturnMsg;
				if(this._warmupFnc) {
					this._warmupFnc(wmsg);
					
					stime = StrUtil._toStringTimestamp(new Date(wmsg.stime));
					etime = StrUtil._toStringTimestamp(new Date(wmsg.etime));
					userReports.push({
                        std_cont_seq: 0,
                        studentId: wmsg.id,
                        ans_tf: '1',
                        ans_submit: 'typ;' + wmsg.msg,
                        ans_starttime: stime ? stime : '',
                        ans_endtime: etime ? etime : '',
                        sc_div1: '',
                        sc_div2: '',
                        sc_div3: '',
                        sc_div4: '',
                        files,
                        ans_correct: '',
                        tab_index: '4',
                    });	 
				}
			} else if(msg.msgtype === 'qna_return') {
				const qmsg = msg as IQNAMsg;
				if(this._qnaFnc) {
                    this._qnaFnc(qmsg);

                    if(qmsg.seq < 0) return; 

                    stime = StrUtil._toStringTimestamp(new Date(qmsg.stime));
                    etime = StrUtil._toStringTimestamp(new Date(qmsg.etime));

                    let ans_submit = 'qna;';
                    let scripts: IScript[] = [];
                    for(let i = 0; i < this._data.scripts.length; i++) {
                        if(this._data.scripts[i].passage_page === qmsg.seq) scripts.push(this._data.scripts[i]);
                    }
                    if(scripts.length === 0) return;

                    qmsg.returns.forEach((val,idx) => {
                        const script = scripts[val];
                        if(script) {
                            if(ans_submit === 'qna;') ans_submit += script.seq + '|' + script.dms_eng;
                            else ans_submit += '§' + script.seq + '|' + script.dms_eng;
                        }
                    });
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
                        files,
                        ans_correct: '',
                        tab_index: '5',
                    });
    			}
			} else if(msg.msgtype === 'question_return') {
				const qmsg = msg as IQuizReturnMsg;
				if(this._questionFnc) {
					this._questionFnc(qmsg);
					this._uploadInclassReport(qmsg);
				}			
			} else if(msg.msgtype === 'graphic_return') {
				const qmsg = msg as IGraphMsg;
				if(this._graphFnc) {
                    this._graphFnc(qmsg);              

				}				
        	} else if(msg.msgtype === 'sheet_return') {
				const qmsg = msg as IGraphSheetMsg;
				if(this._graphSheetFnc) {
                    this._graphSheetFnc(qmsg);
                    
                    stime = StrUtil._toStringTimestamp(new Date(qmsg.stime));
                    etime = StrUtil._toStringTimestamp(new Date(qmsg.etime));

                    let ans_submit = 'img;';
                    let tab_index = '3';
                    if(qmsg.type === 'keyboard') {
                        ans_submit = 'typ;' + qmsg.input;
                        tab_index = '14';
                    } else if(qmsg.input !== '') {
						files = [];
						files.push(qmsg.input);
                    }

                    userReports.push({
                        std_cont_seq: 0,
                        studentId: qmsg.id,
                        ans_tf: '1',
                        ans_submit,
                        ans_starttime: stime ? stime : '',
                        ans_endtime: etime ? etime : '',
                        sc_div1: '',
                        sc_div2: '',
                        sc_div3: '',
                        sc_div4: '',
                        files,
                        ans_correct: '',
                        tab_index,
                    });
				}				
            } else if(msg.msgtype === 'summary_return') {
				const qmsg = msg as IQuizReturnMsg;
				if(this._summaryFnc) {
                    this._summaryFnc(qmsg);              
                    
				}				
			} else if(msg.msgtype === 'v_checkup_return') {
                const qmsg = msg as IQNAMsg;
                if(this._checkupFnc) {
                    this._checkupFnc(qmsg);
				
                    stime = StrUtil._toStringTimestamp(new Date(qmsg.stime));
                    etime = StrUtil._toStringTimestamp(new Date(qmsg.etime));

                    if(qmsg.returns.length !== 1) return;
                    
                    const answer = qmsg.returns[0];

                }
			}
			
			if(userReports.length > 0) {
                console.log('inclassReport(LogFromContentTeacher): ', userReports); // 비상요청 사항                        
                felsocket.uploadInclassReport(userReports);
            }
		}
	}
	public setData(data: any) {
		this._data = initData(data);
		for(let i = 0; i < this._data.warmup.length; i++) {
			this.state.warmup_returns[i] = [];
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
	SENDPROG,
	BTN_DISABLE,
};