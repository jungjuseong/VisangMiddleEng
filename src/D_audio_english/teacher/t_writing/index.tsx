import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';
import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';
import * as felsocket from '../../../felsocket';

import * as common from '../../common';

import { SENDPROG, IStateCtx, IActionsCtx } from '../t_store';
import { IMsg,IData,IFocusMsg } from '../../common';

import ScriptContainer from '../../script_container';
import { TimerState } from '../../../share/Timer';

import IntroQuiz from './_intro_quiz';
import ConfirmQuiz from './confirm_quiz';
import AdditionalQuiz from './additional_quiz';
import DictationQuiz from './_dictation_quiz';
import PopTrans from './_pop_trans';

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
    
    private m_player = new MPlayer(new MConfig(true));
    private m_player_inittime = 0; // 비디오 시작시간 
	
	@observable private c_popup: 'off'|'Q&A' |'ROLE PLAY'|'SHADOWING' = 'off';
	@observable private _tab: 'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT' = 'INTRODUCTION';

	private _tab_save: 'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT' = 'INTRODUCTION';
	@observable private _hint = false;

	@observable private _view = false;
	@observable private _curQidx = 0;
	@observable private _viewClue = false;
	@observable private _viewTrans = false;
	@observable private _viewScript = false;
	@observable private _letstalk = false;
	@observable private _popTrans = false;
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
        this.m_player_inittime = 0;

        this.m_player.addOnPlayEnd(() => {
            this._lastFocusIdx = -1;
            this._focusIdx = -1;
            this.m_player.setMutedTemp(false);
            this._sendDialogueEnd();
            if (this._roll === '' && !this._shadowing) this.props.actions.setNavi(true, true);
            else if(this._shadowing) this._isShadowPlay = false;
        });
        this.m_player.addOnState((newState, oldState) => {
            let msgtype: 'playing'|'paused';
            if(this._shadowing) msgtype = this._isShadowPlay ? 'playing' : 'paused';
            else msgtype = newState !== MPRState.PAUSED && this.m_player.bPlay ? 'playing' : 'paused';
            const msg: common.IMsg = {
                msgtype,
            };
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);
        });
    }
    
	public componentDidMount() {
		this.m_data = this.props.actions.getData();
    }
    
	private onSend = () => {
        const { actions, state } = this.props;

        if(this._tab === 'INTRODUCTION') return;
        if(this._tab === 'CONFIRM' && state.confirmBasicProg !==  SENDPROG.READY) return;
        if(this._tab === 'ADDITIONAL' && state.additionalBasicProg !==  SENDPROG.READY) return;
        if(this._tab === 'DICTATION' && state.dictationProg !==  SENDPROG.READY) return;
        if(this._tab === 'SCRIPT' && state.scriptProg !==  SENDPROG.READY) return;

        
        if(this._tab === 'CONFIRM') state.confirmBasicProg = SENDPROG.SENDING;
        else if(this._tab === 'ADDITIONAL') state.additionalBasicProg = SENDPROG.SENDING;
        else if(this._tab === 'DICTATION') state.additionalBasicProg = SENDPROG.SENDING;
        else if(this._tab === 'SCRIPT') state.additionalBasicProg = SENDPROG.SENDING;
        else return;

        App.pub_playToPad();
        App.pub_reloadStudents(() => {
            let msg: IMsg;
            
            actions.clearReturnUsers();
            actions.setRetCnt(0);
            actions.setNumOfStudent(App.students.length);
            
            if(this._tab === 'CONFIRM') {
                switch(this._curQidx){
                    case 1 : {
                        if(state.confirmBasicProg !==  SENDPROG.SENDING) return;
                        state.confirmBasicProg = SENDPROG.SENDED;
                        msg = {msgtype: 'confirm_send',};
                        break;
                    } 
                    default : {
                        if(state.confirmBasicProg !==  SENDPROG.SENDING) return;
                        state.confirmBasicProg = SENDPROG.SENDED;
                        msg = {msgtype: 'confirm_send',};
                        break;
                    }
                }
            } else {
                if(state.scriptProg !==  SENDPROG.SENDING) return;
                state.scriptProg = SENDPROG.SENDED;
                msg = {msgtype: 'script_send',};
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
        const dictations = this.m_data.introduction;
        for(let i = 0; i < dictations.length; i++) {
            this._qselected[i] = -1;
        }
        this._curQidx = 0;
        this._hint = false;
        this.c_popup = 'off';
        this._viewClue = false;
        this._viewTrans = false;
        this._viewScript = false;
        this._roll = '';
        this._isShadowPlay = false;
        this._shadowing = false;

        this._lastFocusIdx = -1;
        this._focusIdx = -1;

        actions.setNavi(true, true);

        actions.init();
        felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);

	}
    
	private _clickIntroduction = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions,state } = this.props;
        const { confirmBasicProg,qnaProg} = state;

        if(this._tab === 'INTRODUCTION') return;
        if(confirmBasicProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
        
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
        const { confirmBasicProg,qnaProg } = this.props.state;

        if (this._tab === 'CONFIRM') return;
        if (confirmBasicProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;

        App.pub_stop();
        App.pub_playBtnTab();
        this._hint = false;
        this._tab = 'CONFIRM';
        actions.setNavi(true, true);
    }
    private _clickAdditional = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions } = this.props;
        const { confirmBasicProg,qnaProg } = this.props.state;

        if (this._tab === 'ADDITIONAL') return;
        if (confirmBasicProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;

        App.pub_stop();
        App.pub_playBtnTab();
        this._hint = false;
        this._tab = 'ADDITIONAL';
        actions.setNavi(true, true);
    }
    private _clickDictation = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions } = this.props;
        const { confirmBasicProg,qnaProg } = this.props.state;

        if (this._tab === 'DICTATION') return;
        if (confirmBasicProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;

        App.pub_stop();
        App.pub_playBtnTab();
        this._hint = false;
        this._tab = 'DICTATION';
        actions.setNavi(true, true);
    }
    private _clickScript = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions } = this.props;
        const { confirmBasicProg,qnaProg } = this.props.state;

        if (this._tab === 'SCRIPT') return;
        if (confirmBasicProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;

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
    //SCRIPT
    private _refScriptContainer = (el: ScriptContainer) => {
		if(this._scontainer || !el) return;
		this._scontainer = el;
    }
    
    private _qnaReturnsClick = (idx: number) => {
		if(this._tab !== 'SCRIPT') return;
		else if(this.props.state.qnaProg < SENDPROG.SENDED) return;

		const returns = this.props.actions.getQnaReturns();
		if(idx >= returns.length || returns[idx].users.length <= 0) return;
		
		App.pub_playBtnTab();
		felsocket.startStudentReportProcess($ReportType.JOIN, returns[idx].users);	
    }
    private _clickItem = (idx: number, script: common.IScript) => {
		if(this._roll !== '' || this._shadowing) {
			/*
			if(!this._countdown.isRunning) {
				this.m_player.seek(script.dms_start * 1000);
				if(!this.m_player.bPlay) this.m_player.play();
			}
			*/
		} else {
			this.m_player.gotoAndPlay(script.audio_start * 1000, script.audio_end * 1000, 1);
		}
    }

    private _sendDialogueEnd() {
		const msg: common.IMsg = {
			msgtype: 'script_end',
		};
		felsocket.sendPAD($SocketType.MSGTOPAD, msg);
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
        const confirmBasicProg = state.confirmBasicProg;
        const additionalSupProg = state.additionalSupProg

        if(	this._tab !== 'CONFIRM' || 
            confirmBasicProg !== SENDPROG.SENDED
        ) return;


        App.pub_playBtnTab();
       
        const msg: IFocusMsg = {
            msgtype: 'confirm_end',
            idx:1
        };
        felsocket.sendPAD($SocketType.MSGTOPAD, msg);

        //this.props.state.confirmBasicProg = SENDPROG.COMPLETE;
        actions.quizComplete();
        console.log(this.props.state.confirmBasicProg);
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
    
    private _onPopTrans = () => {
		App.pub_playBtnTab();
		this._popTrans = true;
		this.props.actions.setNaviView(false);
	}
	private _PopTransClosed = () => {
		this._popTrans = false;
		this.props.actions.setNaviView(true);
	}
	private _letstalkClosed = () => {
		this._letstalk = false;
		this.props.actions.setNaviView(true);
	}
	private _setNavi() {
        const { state,actions } = this.props;
        const { confirmBasicProg,qnaProg } = state;

        actions.setNaviView(true);
        if(this._curQidx === 0 && this._tab === 'INTRODUCTION') actions.setNavi(false, true);
        else if(confirmBasicProg === SENDPROG.SENDED) actions.setNavi(this._curQidx === 0 ? false : true, this._curQidx === this.m_data.introduction.length - 1 ? false : true);
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
                        if(confirmBasicProg === SENDPROG.SENDED || confirmBasicProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
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
                        if(confirmBasicProg === SENDPROG.SENDED || confirmBasicProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
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
                        if(confirmBasicProg === SENDPROG.SENDED || confirmBasicProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
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
                        if(confirmBasicProg === SENDPROG.SENDED || confirmBasicProg === SENDPROG.SENDING || qnaProg >= SENDPROG.SENDING) return;
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
            this._popTrans = false;
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
        const { confirmBasicProg,qnaProg,numOfStudent,retCnt } = state;

        const introductions = this.m_data.introduction;
        const dictations = [this.m_data.dictation_sup, this.m_data.dictation_basic, this.m_data.dictation_hard];
        const isQComplete = confirmBasicProg >= SENDPROG.COMPLETE;

        const isOnStudy = ((confirmBasicProg === SENDPROG.SENDING || confirmBasicProg === SENDPROG.SENDED || qnaProg >= SENDPROG.SENDING));
        
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
                            (isCompC && state.confirmBasicProg < SENDPROG.SENDED) ||
                            (isCompA && state.additionalBasicProg < SENDPROG.SENDED) ||
                            (isCompD && state.dictationProg < SENDPROG.SENDED) ||
                            (isCompS && state.scriptProg < SENDPROG.SENDED);
        
        const isViewInfo = (isCompI && confirmBasicProg >= SENDPROG.SENDED) || isCompS;
        const isViewReturn = (isCompI && confirmBasicProg >= SENDPROG.SENDED) || (isCompS && qnaProg >=  SENDPROG.SENDED);
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
                <ToggleBtn className="btn_pop_trans" view={view && this._tab === 'SCRIPT'} on={this._popTrans} onClick={this._onPopTrans} />
                <PopTrans 
                    view={this._popTrans} 
                    data={this.m_data.script} 
                    onClosed={this._PopTransClosed}
                />
                <div className="writing_content_box">
                    {/* index */}
                    <div className="btn_page_box">
                        {introductions.map((introduction, idx) => {
                            return <NItemW key={idx} tab={this._tab} on={idx === this._curQidx} idx={idx} onClick={this._onPage}/>;
                        })}
                    </div>
                    
                    <div className={'question' + (confirmBasicProg >= SENDPROG.COMPLETE ? ' complete' : '')} style={{display: this._tab === 'INTRODUCTION' ? '' : 'none'}}>
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
                    <div className={'question' + (confirmBasicProg >= SENDPROG.COMPLETE ? ' complete' : '')} style={{display: this._tab === 'CONFIRM' ? '' : 'none'}}>
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
                    <div className={'question' + (confirmBasicProg >= SENDPROG.COMPLETE ? ' complete' : '')} style={{display: this._tab === 'ADDITIONAL' ? '' : 'none'}}>
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
                    <div className={'question' + (confirmBasicProg >= SENDPROG.COMPLETE ? ' complete' : '')} style={{display: this._tab === 'DICTATION' ? '' : 'none'}}>
                        {dictations.map((dictation, idx) => {
                            return (
                            <div key={idx}>
                                <DictationQuiz 
                                    view={view && idx === this._curQidx}
                                    data={dictation}
                                    onClosed={this._letstalkClosed}
                                    onHintClick={this._clickAnswer}
                                />                          
                            </div>
                            );
                        })}
                    </div>
                    <div className={'script_container' + (this._tab === 'SCRIPT' ? '' : ' hide')} style={{display: this._tab === 'SCRIPT' ? '' : 'none'}}>
                        <ScriptContainer
                            ref={this._refScriptContainer}
                            view={this.props.view}
                            data={this.m_data}
                            focusIdx={this._curQidx}
                            selected={this._selected}
                            qnaReturns={this.props.actions.getQnaReturns()}
                            qnaReturnsClick={this._qnaReturnsClick}
                            roll={this._roll}
                            shadowing={this._shadowing}
                            clickThumb={this._clickItem}
                            noSwiping={((this._shadowing && this._isShadowPlay) || (!this._shadowing && this.m_player.bPlay))}
                            viewClue={this._viewClue}
                            viewScript={this._viewScript}
                            viewTrans={this._viewTrans}
                            numRender={state.retCnt}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Writing;