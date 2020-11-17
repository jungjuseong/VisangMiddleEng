import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import SendUINew from '../../../share/sendui_new';
import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';
import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';
import * as felsocket from '../../../felsocket';



import { SENDPROG, IStateCtx, IActionsCtx } from '../t_store';
import { IMsg,IData,IRollMsg,IFocusMsg } from '../../common';

import ScriptContainer from '../../script_container';
import { TimerState } from '../../../share/Timer';

import IntroQuiz from './_intro_quiz';
import ConfirmQuiz from './confirm_quiz';
import AdditionalQuiz from './additional_quiz';
import ComprePopup from './_compre_popup';
import { SSL_OP_TLS_BLOCK_PADDING_BUG } from 'constants';

/* 페이지 관련 class */
class NItemW extends React.Component<{ idx: number, on: boolean, tab: 'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT', onClick: (idx: number) => void }> {
	private _click = () => {
		this.props.onClick(this.props.idx);
	}
	public render() {
        const { idx, on, tab } = this.props;
        if(['INTRODUCTION','SCRIPT'].includes(tab)) {
            return <span className={on ? 'on' : ''} onClick={this._click}>{idx + 1}</span>;
        } else if(['CONFIRM','ADDITIONAL','DICTATION'].includes(tab)) {           
            let pageText = '보충';
            if (idx === 1) pageText = '기본';
            else if (idx === 2) pageText = '심화';
            
            return <span className={on ? 'on' : ''} onClick={this._click}>{pageText}</span>;
        } else {
            return <span className={on ? 'on' : ''} onClick={this._click}>{idx + 1}</span>;
        }
	}
}

interface IWriting {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class Writing extends React.Component<IWriting> {
	private m_data: IData;
	
	@observable private c_popup: 'off'|'Q&A' |'ROLE PLAY'|'SHADOWING' = 'off';
	@observable private _tab: 'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT' = 'INTRODUCTION';

	private _tab_save: 'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT' = 'INTRODUCTION';
	@observable private _hint = false;

	@observable private _view = false;
	@observable private _curQidx = 0;
	@observable private _viewClue = false;
	@observable private _viewTrans = false;
	@observable private _viewScript = true;
	@observable private _letstalk = false;
	@observable private _viewQuiz = true;

	@observable private _roll: ''|'A'|'B' = '';
	@observable private _shadowing = false;
	@observable private _focusIdx = -1;
	@observable private _isShadowPlay = false;

	@observable private _qselected: number[] = [];

	private _selected: number[] = [];
	private _lastFocusIdx = -1;
	private _countdown = new TimerState(3);

	// private _rollProg: SENDPROG = SENDPROG.READY;
	private _scontainer?: ScriptContainer;
	
	public constructor(props: IWriting) {
        super(props);
        this.m_data = props.actions.getData();
    }
    
	public componentDidMount() {
		this.m_data = this.props.actions.getData();
    }
    
	private onSend = () => {
        const { actions, state } = this.props;

        if(this._tab === 'INTRODUCTION') return;
        if(this._tab === 'CONFIRM' && state.confirmProg !==  SENDPROG.READY) return;
        if(this._tab === 'ADDITIONAL' && state.additionalProg !==  SENDPROG.READY) return;
        if(this._tab === 'DICTATION' && state.dictationProg !==  SENDPROG.READY) return;
        if(this._tab === 'SCRIPT' && state.scriptProg !==  SENDPROG.READY) return;

        
        if(this._tab === 'CONFIRM') state.confirmProg = SENDPROG.SENDING;
        else if(this._tab === 'ADDITIONAL') state.additionalProg = SENDPROG.SENDING;
        else if(this._tab === 'DICTATION') state.additionalProg = SENDPROG.SENDING;
        else if(this._tab === 'SCRIPT') state.additionalProg = SENDPROG.SENDING;
        else return;

        App.pub_playToPad();
        App.pub_reloadStudents(() => {
            let msg: IFocusMsg;
            
            actions.clearReturnUsers();
            actions.setRetCnt(0);
            actions.setNumOfStudent(App.students.length);
            
            if(this._tab === 'CONFIRM') {
                if(state.confirmProg !==  SENDPROG.SENDING) return;
                state.confirmProg = SENDPROG.SENDED;
                msg = {msgtype: 'confirm_send',idx: 1,};
            } else {
                if(state.scriptProg !==  SENDPROG.SENDING) return;
                state.scriptProg = SENDPROG.SENDED;
                msg = {msgtype: 'script_send',idx : 1,};
            } 
            
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);

            this._setNavi();
        });
	}

	// private _onPopupSend = (roll: ''|'A'|'B') => {
    //     const {state, actions} = this.props;
    //     if(this.c_popup === 'Q&A') {
    //         if(this._title !== 'COMPREHENSION') return;
    //         else if(state.qnaProg > SENDPROG.READY) return;

    //         state.qnaProg = SENDPROG.SENDING;
    //         App.pub_playToPad();

    //         let msg: IMsg = {msgtype: 'qna_send',};
    //         felsocket.sendPAD($SocketType.MSGTOPAD, msg);


    //         // this._viewClue = false;
    //         _.delay(() => {
    //             if(	this._title !== 'COMPREHENSION' ) return;
    //             else if(state.qnaProg !== SENDPROG.SENDING) return;

    //             state.qnaProg = SENDPROG.SENDED;
    //         }, 300);            
            
    //     } else if(this.c_popup === 'ROLE PLAY') {
    //         if (this._title !== 'DIALOGUE') return;
    //         if(state.dialogueProg !== SENDPROG.SENDED) return;
    //         if(this._roll !== '' || roll === '') return;

    //         this._lastFocusIdx = 0;
    //         this._focusIdx = -1;

    //         let msg: IRollMsg = {msgtype: 'roll_send', roll};
    //         felsocket.sendPAD($SocketType.MSGTOPAD, msg);

    //         _.delay(() => {
    //             if(this._title !== 'DIALOGUE') return;
    //             else if(state.dialogueProg !== SENDPROG.SENDED) return;
    //             this._roll = roll;
    //         }, 300);

    //     } else if(this.c_popup === 'SHADOWING') {
    //         if(this._title !== 'DIALOGUE') return;
    //         else if(state.dialogueProg !== SENDPROG.SENDED) return;
    //         else if(this._shadowing) return;

    //         this._lastFocusIdx = 0;
    //         this._focusIdx = -1;

    //         let msg: IMsg = {msgtype: 'shadowing_send'};
    //         felsocket.sendPAD($SocketType.MSGTOPAD, msg);

    //         _.delay(() => {
    //             if(this._title !== 'DIALOGUE') return;
    //             else if(state.dialogueProg !== SENDPROG.SENDED) return;
    //             this._shadowing = true;
    //         }, 300);
    //     }
    //     this.props.actions.setNavi(false, false);
    // }
    // 인트로 페이지로 이동
	private _goToIntro = () => {
        alert('go to Intro page');
        this.props.actions.gotoDirection();
        // this._testQuiz = true;
        return;
    }

	private _onPage = (idx: number) => {
        const { actions } = this.props;

        App.pub_stop();
        App.pub_playBtnTab();
        
        this._curQidx = idx;
        actions.setNavi((this._tab !== 'INTRODUCTION' || this._curQidx !== 0), true);
        // if(this._tab === 'QUESTION' && this._curQidx === 0) actions.setNavi(false, true);
        // else actions.setNavi(true, true);
        
        this._hint = (this._tab === 'SCRIPT');
    }
    
	private _clearAll() {
        const { actions } = this.props;
        App.pub_stop();
        this._tab = 'INTRODUCTION';

        const introductions = this.m_data.introduction;
        for(let i = 0; i < introductions.length; i++) {
            this._qselected[i] = -1;
        }
        this._curQidx = 0;
        this._hint = false;
        this.c_popup = 'off';
        this._viewClue = false;
        this._viewTrans = false;
        this._viewScript = true;
        this._roll = '';
        this._isShadowPlay = false;
        this._shadowing = false;

        this._lastFocusIdx = -1;
        this._focusIdx = -1;

        actions.setNavi(true, true);

        actions.init();
        felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);

	}
    
	// private _clickDial = (ev: React.MouseEvent<HTMLElement>) => {
    //     const {confirmProg,qnaProg} = this.props.state;

    //     if(this._title === 'DIALOGUE') return;
    //     if(confirmProg === SENDPROG.SENDED || confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
		
    //     App.pub_playBtnTab();
    //     this._clearAll();
    //     this._title = 'DIALOGUE';
    //     this._tab_save = this._tab;
    //     this._tab = 'SCRIPT';
    //     this._viewScript = false;
    // }
    
	private _clickIntroduction = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions,state } = this.props;
        const { confirmProg,qnaProg} = state;

        if(this._tab === 'INTRODUCTION') return;
        if(confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
        
        App.pub_playBtnTab();
        this._hint = false;
        this._tab = 'INTRODUCTION';
        if(state.scriptProg > SENDPROG.READY) {
            state.scriptProg = SENDPROG.READY;
            felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);

            actions.clearQnaReturns();
        }
        if(this._curQidx === 0) actions.setNavi(false, true);
    }
    
	private _clickConfirm = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions } = this.props;
        const { confirmProg,qnaProg } = this.props.state;

        if (this._tab === 'CONFIRM') return;
        if (confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;

        App.pub_stop();
        App.pub_playBtnTab();
        this._hint = false;
        this._tab = 'CONFIRM';
        actions.setNavi(true, true);
    }
    private _clickAdditional = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions } = this.props;
        const { confirmProg,qnaProg } = this.props.state;

        if (this._tab === 'ADDITIONAL') return;
        if (confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;

        App.pub_stop();
        App.pub_playBtnTab();
        this._hint = false;
        this._tab = 'ADDITIONAL';
        actions.setNavi(true, true);
    }
    private _clickDictation = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions } = this.props;
        const { confirmProg,qnaProg } = this.props.state;

        if (this._tab === 'DICTATION') return;
        if (confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;

        App.pub_stop();
        App.pub_playBtnTab();
        this._hint = false;
        this._tab = 'DICTATION';
        actions.setNavi(true, true);
    }
    private _clickScript = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions } = this.props;
        const { confirmProg,qnaProg } = this.props.state;

        if (this._tab === 'SCRIPT') return;
        if (confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;

        App.pub_stop();
        App.pub_playBtnTab();
        this._hint = false;
        this._tab = 'SCRIPT';
        actions.setNavi(true, true);
    }
    
	private _clickReturn = () => {
        const { actions } = this.props;

        App.pub_playBtnTab();

        const isCompQ = (this._tab === 'INTRODUCTION');

        if(isCompQ) felsocket.startStudentReportProcess($ReportType.JOIN, actions.getReturnUsersForQuiz());

        else felsocket.startStudentReportProcess($ReportType.JOIN, actions.getReturnUsers());

	}

	/* 누른 학생만 보이게 하는 런쳐결과  수정안됨*/
	private _clickPerson = (idx: number) => {
		App.pub_playBtnTab();
		const quizResults = this.props.actions.getResult();
		const quizResult = quizResults[this._curQidx];
		if(!quizResult) return;

        if(idx === 1) felsocket.startStudentReportProcess($ReportType.JOIN, quizResult.u1);
        
        else if(idx === 2) felsocket.startStudentReportProcess($ReportType.JOIN, quizResult.u2);
        
        else if(idx === 3) felsocket.startStudentReportProcess($ReportType.JOIN, quizResult.u3);
        
	}

	private _clickAnswer = () => {
        const {state, actions} = this.props;
        const confirmProg = state.confirmProg;

        if(	this._tab !== 'CONFIRM' || 
            confirmProg !== SENDPROG.SENDED
        ) return;

        App.pub_playBtnTab();
       
        const msg: IFocusMsg = {
            msgtype: 'confirm_end',
            idx:1
        };
        felsocket.sendPAD($SocketType.MSGTOPAD, msg);

        this.props.state.confirmProg = SENDPROG.COMPLETE;
        actions.quizComplete();
        console.log(this.props.state.confirmProg);
        // this.props.actions.setNavi(true,true);
	}

	// private _sendFocusIdx(idx: number) {
	// 	const msg: IFocusMsg = {
	// 		msgtype: 'focusidx',
	// 		idx,
	// 	};
    //     felsocket.sendPAD($SocketType.MSGTOPAD, msg);
        
	// }
	// private _sendDialogueEnd() {
	// 	const msg: IMsg = {
	// 		msgtype: 'dialogue_end',
	// 	};
    //     felsocket.sendPAD($SocketType.MSGTOPAD, msg);
        
	// }

	private _letstalkClosed = () => {
		this._letstalk = false;
		this.props.actions.setNaviView(true);
	}
	private _setNavi() {
        const { state,actions } = this.props;
        const { confirmProg,qnaProg } = state;

        actions.setNaviView(true);
        if(this._curQidx === 0 && this._tab === 'INTRODUCTION') actions.setNavi(false, true);
        else if(confirmProg === SENDPROG.SENDED) actions.setNavi(this._curQidx === 0 ? false : true, this._curQidx === this.m_data.introduction.length - 1 ? false : true);
		else actions.setNavi(true, true);
		
        actions.setNaviFnc(
            () => {
                if(this._tab === 'INTRODUCTION') {
                    if(this._curQidx === 0) {
                        actions.gotoDirection();
                    } else {
                        this._hint = false;
                        this._curQidx = this._curQidx - 1;
                        this._setNavi();
                    }
                } else if(this._tab === 'CONFIRM') {
                    // if(confirmProg === SENDPROG.SENDED || confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
                    if(this._curQidx === 0) {
                        this._hint = false;
                        this._tab = 'INTRODUCTION';
                        this._curQidx = this.m_data.introduction.length - 1;
                    } else {
                        this._hint = false;
                        this._curQidx = this._curQidx - 1;
                        this._setNavi();
                    }
                    // if(state.scriptProg > SENDPROG.READY) {
                    //     state.scriptProg = SENDPROG.READY;
                    //     felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);

                    //     actions.clearQnaReturns();
                    // }
                } else if(this._tab === 'ADDITIONAL') {
                    if(this._curQidx === 0) {
                        this._hint = false;
                        this._tab = 'CONFIRM';
                        this._curQidx = this.m_data.introduction.length - 1;
                    } else {
                        this._hint = false;
                        this._curQidx = this._curQidx - 1;
                        this._setNavi();
                    }
                } else if(this._tab === 'DICTATION') {
                    if(this._curQidx === 0) {
                        this._hint = false;
                        this._tab = 'ADDITIONAL';
                        this._curQidx = this.m_data.introduction.length - 1;
                    } else {
                        this._hint = false;
                        this._curQidx = this._curQidx - 1;
                        this._setNavi();
                    }
                } else if(this._tab === 'SCRIPT') {
                    if(this._curQidx === 0) {
                        this._hint = false;
                        this._tab = 'DICTATION';
                        this._curQidx = this.m_data.introduction.length - 1;
                    } else {
                        this._hint = false;
                        this._curQidx = this._curQidx - 1;
                        this._setNavi();
                    }
                }
            },
            () => {
                if(this._tab === 'INTRODUCTION') {
                    if(this._curQidx === this.m_data.introduction.length - 1) {
                        if(confirmProg === SENDPROG.SENDED || confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
                        this._hint = false;
                        this._tab = 'CONFIRM';
                        this._curQidx = 0;
                    } else {
                        this._hint = false;
                        this._curQidx = this._curQidx + 1;
                        this._setNavi();
                    }
                } else if(this._tab === 'CONFIRM') {
                    if(this._curQidx === this.m_data.introduction.length - 1) {
                        if(confirmProg === SENDPROG.SENDED || confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
                        this._hint = false;
                        this._tab = 'ADDITIONAL';
                        this._curQidx = 0;
                    } else {
                        this._hint = false;
                        this._curQidx = this._curQidx + 1;
                        this._setNavi();
                    }
                } else if(this._tab === 'ADDITIONAL') {
                    if(this._curQidx === this.m_data.introduction.length - 1) {
                        if(confirmProg === SENDPROG.SENDED || confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
                        this._hint = false;
                        this._tab = 'DICTATION';
                        this._curQidx = 0;
                    } else {
                        this._hint = false;
                        this._curQidx = this._curQidx + 1;
                        this._setNavi();
                    }
                } else if(this._tab === 'DICTATION') {
                    if(this._curQidx === this.m_data.introduction.length - 1) {
                        if(confirmProg === SENDPROG.SENDED || confirmProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
                        this._hint = false;
                        this._tab = 'SCRIPT';
                        this._curQidx = 0;
                    } else {
                        this._hint = false;
                        this._curQidx = this._curQidx + 1;
                        this._setNavi();
                    }
                } else if(this._tab === 'SCRIPT') {
                    if(this._curQidx !== this.m_data.introduction.length - 1) {                        
                        this._hint = false;
                        this._curQidx = this._curQidx + 1;
                        this._setNavi();
                    }
                }
            }
        );
	}

	public componentDidUpdate(prev: IWriting) {
        const { view } = this.props;

        if (view && !prev.view) {
            this._clearAll();
            this._view = true;
            this._setNavi();
            this._letstalk = false;
        } else if (!view && prev.view) {
            this.c_popup = 'off';
            this._lastFocusIdx = -1;
            this._focusIdx = -1;
            this._roll = '';
            this._isShadowPlay = false;
            this._shadowing = false;
            App.pub_stop();
        }
    }

	public render() {
        const { view, state, actions } = this.props;
        const { confirmProg,qnaProg,numOfStudent,retCnt } = state;

        const introductions = this.m_data.introduction;
        const confirm_nomals = this.m_data.confirm_nomal;
        const isQComplete = confirmProg >= SENDPROG.COMPLETE;

        const isOnStudy = ((confirmProg === SENDPROG.SENDING || confirmProg === SENDPROG.SENDED || qnaProg >= SENDPROG.SENDING));
        
        const quizResult = actions.getResult();
        let qResult = -1;        
        if(isQComplete) {
            qResult = 0;
            if(qResult > 100) qResult = 100;
        }

        const isCompI = (this._tab === 'INTRODUCTION');
        const isCompC = (this._tab === 'CONFIRM');
        const isCompA = (this._tab === 'ADDITIONAL');
        const isCompD = (this._tab === 'DICTATION');
        const isCompS = (this._tab === 'SCRIPT');
        const isViewSend = (!isCompI) &&
                            (isCompC && state.confirmProg < SENDPROG.SENDED) ||
                            (isCompA && state.additionalProg < SENDPROG.SENDED) ||
                            (isCompD && state.dictationProg < SENDPROG.SENDED) ||
                            (isCompS && state.scriptProg < SENDPROG.SENDED);
        
        const isViewInfo = (isCompI && confirmProg >= SENDPROG.SENDED) || isCompS;
        const isViewReturn = (isCompI && confirmProg >= SENDPROG.SENDED) || (isCompS && qnaProg >=  SENDPROG.SENDED);
        const style: React.CSSProperties = {};
    
        return (
            <div className={'t_writing '} style={style}>

                <div className="close_box">
                    <ToggleBtn className="btn_intro" onClick={this._goToIntro}/>
                </div>
                <div className="btn_tabs">
                    <ToggleBtn className="btn_tab_introduction" onClick={this._clickIntroduction} on={this._tab === 'INTRODUCTION'} disabled={this._tab === 'INTRODUCTION' || isOnStudy} />
                    <ToggleBtn className="btn_tab_confirm" onClick={this._clickConfirm} on={this._tab === 'CONFIRM'} disabled={this._tab === 'CONFIRM' || isOnStudy} />
                    <ToggleBtn className="btn_tab_additional" onClick={this._clickAdditional} on={this._tab === 'ADDITIONAL'} disabled={this._tab === 'ADDITIONAL' || isOnStudy} />
                    <ToggleBtn className="btn_tab_dictation" onClick={this._clickDictation} on={this._tab === 'DICTATION'} disabled={this._tab === 'DICTATION' || isOnStudy} />
                    <ToggleBtn className="btn_tab_script" onClick={this._clickScript} on={this._tab === 'SCRIPT'} disabled={this._tab === 'SCRIPT' || isOnStudy} />
                </div>
                <div className={'info_box' + (isViewInfo ? ' on' : '')}>
                    <div className="return_cnt_box white" style={{display: isViewReturn ? '' : 'none'}} onClick={this._clickReturn}>
                        <div>{retCnt}/{numOfStudent}</div>
                    </div>            
                </div>	
                <div className="writing_content_box">
                    {/* index */}
                    <div className="btn_page_box">
                        {introductions.map((introduction, idx) => {
                            return <NItemW key={idx} tab={this._tab} on={idx === this._curQidx} idx={idx} onClick={this._onPage}/>;
                        })}
                    </div>
                    
                    <div className={'question' + (confirmProg >= SENDPROG.COMPLETE ? ' complete' : '')} style={{display: this._tab === 'INTRODUCTION' ? '' : 'none'}}>
                            {introductions.map((introduction, idx) => {
                                return (
                                    <div key={idx} style={{ display: idx === this._curQidx ? '' : 'none' }}>
                                        <IntroQuiz 
                                            view={view && idx === this._curQidx}
                                            data={introduction} 
                                            onClosed={this._letstalkClosed}
                                        />                          
                                    </div>
                                );
                            })}
                    </div>
                    <div className={'question' + (confirmProg >= SENDPROG.COMPLETE ? ' complete' : '')} style={{display: this._tab === 'CONFIRM' ? '' : 'none'}}>
                        <div key={1} >
                            <ConfirmQuiz 
                                view={view}
                                index ={this._curQidx}
                                mdata={this.m_data} 
                                onClosed={this._letstalkClosed}
                                onHintClick={this._clickAnswer}
                            />                          
                        </div>              
                    </div>
                    <div className={'question' + (confirmProg >= SENDPROG.COMPLETE ? ' complete' : '')} style={{display: this._tab === 'ADDITIONAL' ? '' : 'none'}}>
                        <div key={1} >
                            <AdditionalQuiz 
                                view={view}
                                index ={this._curQidx}
                                mdata={this.m_data} 
                                onClosed={this._letstalkClosed}
                                onHintClick={this._clickAnswer}
                            />                          
                        </div>              
                    </div>
                </div>
                <SendUINew
                    view={isViewSend}
                    type={'teacher'}
                    sended={false}
                    originY={0}
                    onSend={this.onSend}
                />
            </div>
        );
    }
}

export default Writing;
