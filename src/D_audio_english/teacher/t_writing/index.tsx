import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';
import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';
import * as felsocket from '../../../felsocket';

import { IMsg } from '../../common';

import SendUINew from '../../../share/sendui_new';
import { SENDPROG, IStateCtx, IActionsCtx } from '../t_store';
import { IData, IIndexMsg ,IConfirmHardMsg } from '../../common';

import { CoverPopup } from '../../../share/CoverPopup';
import CheckResult from './_submit_status_popup';

import IntroQuiz from './_intro_quiz';
import ConfirmQuiz from './confirm_quiz';
import AdditionalQuiz from './additional_quiz';
import HardDictationQuizBox from './_hard_dictation_quiz_box';
import TransPopup from './_trans_popup';
import ScriptAudio from './script_audio';

function falsySended(state: IStateCtx): boolean {
    return (state.confirmBasicProg === SENDPROG.SENDED ||
        state.confirmSupProg === SENDPROG.SENDED || 
        state.confirmHardProg === SENDPROG.SENDED || 
        state.additionalBasicProg === SENDPROG.SENDED ||
        state.additionalSupProg === SENDPROG.SENDED ||
        state.additionalHardProg === SENDPROG.SENDED ||
        state.dictationProg.indexOf(SENDPROG.SENDED) !== -1||
        state.qnaProg >= SENDPROG.SENDING);
}

type ITabType = 'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT';

/* 페이지 관련 class */
class NItemW extends React.Component<{ idx: number, on: boolean, tab: ITabType, onClick: (idx: number) => void }> {
    private static SUB_TAB_MENU = [ '보충','기본','심화'];
	private _click = () => {
		this.props.onClick(this.props.idx);
	}
	public render() {
        const { idx, on, tab } = this.props;
        return (
            <span className={on ? 'on' : ''} onClick={this._click}>
                {(['CONFIRM','ADDITIONAL','DICTATION'].includes(tab)) ? NItemW.SUB_TAB_MENU[idx] : idx + 1}
            </span>
            );        
    }
}

interface IWritingProps {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class Writing extends React.Component<IWritingProps> {
    private m_data: IData;
    
    private m_player = new MPlayer(new MConfig(true));
    private m_player_inittime = 0; // 비디오 시작시간 
    private answerboolean = false;
	
	@observable private c_popup: 'off'|'Q&A' |'ROLE PLAY'|'SHADOWING' = 'off';
	@observable private _tab: ITabType = 'INTRODUCTION';

	private _tab_save: ITabType = 'INTRODUCTION';

	@observable private _view = false;
	@observable private _curQidx = 0;
	@observable private _viewClue = false;
	@observable private _viewTrans = false;
	@observable private _viewScript = false;
	@observable private _letstalk = false;
	@observable private _popTrans = false;
	@observable private _viewResult = false;
    @observable private _viewQuiz = true;
    @observable private _viewpop = false;

	@observable private _roll: ''|'A'|'B' = '';
	@observable private _shadowing = false;
	@observable private _focusIdx = -1;
	@observable private _isShadowPlay = false;

	@observable private _qselected: number[] = [];
	
	public constructor(props: IWritingProps) {
        super(props);
        this.m_data = props.actions.getData();
        this.m_player_inittime = 0;

        this.m_player.addOnPlayEnd(() => {
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
            const msg: IMsg = {
                msgtype,
            };
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);
        });
    }
    
	public componentDidMount() {
		this.m_data = this.props.actions.getData();
    }
    
    private _onClosepop = (hintyon: true | false | null) => {
        const { actions, state } = this.props;
        App.pub_playBtnTab();     
        App.pub_reloadStudents(() => {
            if(hintyon === null) {
                this._viewpop = false;
                state.confirmHardProg = SENDPROG.READY; 
                console.log('null');
                return;
            }
            let msg: IConfirmHardMsg;
            actions.clearReturnUsers();
            actions.setRetCnt(0);
            actions.setNumOfStudent(App.students.length);
            state.confirmHardProg = SENDPROG.SENDING;
            if(state.confirmHardProg !==  SENDPROG.SENDING) return;
            state.confirmHardProg = SENDPROG.SENDED;
            msg = {msgtype: 'confirm_send', idx : 2, hint : hintyon};                
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);

            this._viewpop = false;
            this._setNavi();
        });     
	}

	private onSend = () => {
        const { actions, state } = this.props;

        switch (this._tab) {
        case 'INTRODUCTION':
            return;
        case 'CONFIRM':
            if (this._curQidx === 0 && state.confirmSupProg !==  SENDPROG.READY ||
                this._curQidx === 1 && state.confirmBasicProg !==  SENDPROG.READY ||
                this._curQidx === 2 && state.confirmHardProg !==  SENDPROG.READY) return;
                
            if (this._curQidx === 0) state.confirmSupProg = SENDPROG.SENDING;
            else if(this._curQidx === 1) state.confirmBasicProg = SENDPROG.SENDING;
            else if(this._curQidx === 2) {
                state.confirmHardProg = SENDPROG.SENDED; 
                this._viewpop = true; 
                return;
            }
            break;
        case 'ADDITIONAL':
            if (this._curQidx === 0 && state.additionalSupProg !==  SENDPROG.READY || 
                this._curQidx === 1 && state.additionalBasicProg !==  SENDPROG.READY ||
                this._curQidx === 2 && state.additionalHardProg !==  SENDPROG.READY) return;
            
            if(this._curQidx === 0) state.additionalSupProg = SENDPROG.SENDING;
            else if(this._curQidx === 1) state.additionalBasicProg = SENDPROG.SENDING;
            else if(this._curQidx === 2) state.additionalHardProg = SENDPROG.SENDING;
            break;
        case 'DICTATION':
            for(let i = 0 ; i < 3 ; i++) {
                if(this._curQidx === i && state.dictationProg[i] !==  SENDPROG.READY) return;
            }
            state.dictationProg[this._curQidx] = SENDPROG.SENDING;
            break;
        case 'SCRIPT':
            if(state.scriptProg[this._curQidx] !==  SENDPROG.READY) return;
            state.scriptProg[this._curQidx] = SENDPROG.SENDING;
            break;
        default: return;    
        }

        App.pub_playToPad();
        App.pub_reloadStudents(() => {
            let msg: IIndexMsg;
            
            actions.clearReturnUsers();
            actions.setRetCnt(0);
            actions.setNumOfStudent(App.students.length);
            
            if(this._tab === 'CONFIRM') {
                switch(this._curQidx) {
                    case 0 :
                        if(state.confirmSupProg !==  SENDPROG.SENDING) return;
                        console.log('onsend');
                        state.confirmSupProg = SENDPROG.SENDED;
                        msg = {msgtype: 'confirm_send', idx : 0};
                        break;                    
                    case 1 :
                        if(state.confirmBasicProg !==  SENDPROG.SENDING) return;
                        state.confirmBasicProg = SENDPROG.SENDED;
                        msg = {msgtype: 'confirm_send', idx : 1};
                        break;                    
                    case 2 :
                    default:
                        return;              
                }
            } else if(this._tab === 'ADDITIONAL') {
                switch(this._curQidx) {
                    case 0 :
                        if(state.additionalSupProg !==  SENDPROG.SENDING) return;
                        state.additionalSupProg = SENDPROG.SENDED;
                        msg = {msgtype: 'additional_send', idx : 0};
                        break;
                    case 1:
                        if(state.additionalBasicProg !==  SENDPROG.SENDING) return;
                        state.additionalBasicProg = SENDPROG.SENDED;
                        msg = {msgtype: 'additional_send', idx : 1};
                        break;                
                    case 2 :
                        if(state.additionalHardProg !==  SENDPROG.SENDING) return;
                        state.additionalHardProg = SENDPROG.SENDED;
                        msg = {msgtype: 'additional_send', idx : 2};
                        break;    
                    default:
                        return;
                }
            } else if(this._tab === 'DICTATION') {
                if(state.dictationProg[this._curQidx] !==  SENDPROG.SENDING) return;
                state.dictationProg[this._curQidx] = SENDPROG.SENDED;
                msg = {msgtype: 'dictation_send', idx : this._curQidx};
            } else {
                if(state.scriptProg[this._curQidx] !==  SENDPROG.SENDING) return;
                state.scriptProg[this._curQidx] = SENDPROG.SENDED;
                msg = {msgtype: 'script_send', idx : this._curQidx};
            }             
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);
            this._setNavi();
        });
    }
    
    private _clickConfirmAnswer = () => {
        const {state,actions} = this.props;
        if(this._tab === 'CONFIRM') {
            if(this._curQidx === 0 && state.confirmSupProg !==  SENDPROG.SENDED ||
                this._curQidx === 1 && state.confirmBasicProg !==  SENDPROG.SENDED ||
                this._curQidx === 2 && state.confirmHardProg !==  SENDPROG.SENDED) return;
        }
        App.pub_playBtnTab();
        let msg: IIndexMsg;
        if(this._tab === 'CONFIRM') {
            switch(this._curQidx) {
                case 0 :
                    if(state.confirmSupProg !==  SENDPROG.SENDED) return;
                    state.confirmSupProg = SENDPROG.COMPLETE;
                    msg = {msgtype: 'confirm_end', idx : 0};
                    break;                
                case 1 :
                    if(state.confirmBasicProg !==  SENDPROG.SENDED) return;
                    state.confirmBasicProg = SENDPROG.COMPLETE;
                    msg = {msgtype: 'confirm_end', idx : 1};
                    // actions.quizComplete();
                    break;                
                case 2 :
                    if(state.confirmHardProg !==  SENDPROG.SENDED) return;
                    state.confirmHardProg = SENDPROG.COMPLETE;
                    msg = {msgtype: 'confirm_end', idx : 2};
                    break;                
                default:
                    return;                
            }
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);
            actions.setNavi(true,true);
        }
        
    }
    
    private _clickAdditionalAnswer = () => {
        const {state, actions} = this.props;

        App.pub_playBtnTab();
        let msg: IIndexMsg;
        if(this._tab === 'ADDITIONAL') {
            switch(this._curQidx) {
                case 0:
                    if(state.additionalSupProg !==  SENDPROG.SENDED) return;
                    state.additionalSupProg = SENDPROG.COMPLETE;
                    msg = {msgtype: 'additional_end', idx : 0};
                    break;                
                case 1:
                    if(state.additionalBasicProg !==  SENDPROG.SENDED) return;
                    state.additionalBasicProg = SENDPROG.COMPLETE;
                    msg = {msgtype: 'additional_end', idx : 1};
                    break;                
                case 2:
                    if(state.additionalHardProg !==  SENDPROG.SENDED) return;
                    state.additionalHardProg = SENDPROG.COMPLETE;
                    msg = {msgtype: 'additional_end', idx : 2};
                    break;                
                default:
                    return;
            }
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);
            actions.setNavi(true,true);
        } 
        
	}

    private _clickDictationAnswer = () => {
        const {state, actions} = this.props;

        App.pub_playBtnTab();
        let msg: IIndexMsg;
        if(this._tab === 'DICTATION') {
            if(state.dictationProg[this._curQidx] !==  SENDPROG.SENDED) return;
            state.dictationProg[this._curQidx] = SENDPROG.COMPLETE;
            msg = {msgtype: 'dictation_end', idx : this._curQidx};
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);
            actions.setNavi(true,true);
	    }
    }

    // 인트로 페이지로 이동
	private _goToIntro = () => {
        alert('go to Intro page');
        this.props.actions.gotoDirection();
        // this._testQuiz = true;
        return;
    }

	private _onPage = (idx: number) => {
        const { actions , state} = this.props;

        if (falsySended(state)) return;
        if(state.scriptProg.find(it => it>SENDPROG.READY) != undefined) {
            state.scriptProg = [SENDPROG.READY,SENDPROG.READY,SENDPROG.READY];
            actions.clearQnaReturns();
        } 

        App.pub_stop();
        App.pub_playBtnTab();
        felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
        this._curQidx = idx;
        this._setNavi()
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
        this.c_popup = 'off';
        this._viewClue = false;
        this._viewTrans = false;
        this._viewScript = false;
        this._roll = '';
        this._isShadowPlay = false;
        this._shadowing = false;
        this._focusIdx = -1;

        actions.setNavi(true, true);
        actions.init();
        felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
	}
    
	private _clickIntroduction = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions,state } = this.props;

        if(this._tab === 'INTRODUCTION') return;
        if (falsySended(state)) return;
        
        if(state.scriptProg.find(it => it>SENDPROG.READY) != undefined) {
            state.scriptProg = [SENDPROG.READY,SENDPROG.READY,SENDPROG.READY];
            actions.clearQnaReturns();
        }  
        App.pub_stop();

        App.pub_playBtnTab();
        this._curQidx = 0;
        this._tab = 'INTRODUCTION';
        felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
        actions.clearQnaReturns();
        if(this._curQidx === 0) actions.setNavi(false, true);
    }

	private _clickConfirm = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions ,state} = this.props;

        if (this._tab === 'CONFIRM') return;
        if (falsySended(state)) return;

        if(state.scriptProg.find(it => it>SENDPROG.READY) != undefined) {
            state.scriptProg = [SENDPROG.READY,SENDPROG.READY,SENDPROG.READY];
            actions.clearQnaReturns();
        } 
        App.pub_stop();
        App.pub_playBtnTab();
        felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
        this._curQidx = 0;
        this._tab = 'CONFIRM';
        actions.setNavi(true, true);
    }

    private _clickAdditional = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions ,state} = this.props;

        if (this._tab === 'ADDITIONAL') return;
        if (falsySended(state)) return;

        if(state.scriptProg.find(it => it>SENDPROG.READY) != undefined) {
            state.scriptProg = [SENDPROG.READY,SENDPROG.READY,SENDPROG.READY];
            actions.clearQnaReturns();
        } 
        App.pub_stop();
        App.pub_playBtnTab();
        felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
        this._curQidx = 0;
        this._tab = 'ADDITIONAL';
        actions.setNavi(true, true);
    }

    private _clickDictation = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions ,state} = this.props;

        if (this._tab === 'DICTATION') return;
        if (falsySended(state)) return;       

        if(state.scriptProg.find(it => it>SENDPROG.READY) != undefined) {
            state.scriptProg = [SENDPROG.READY,SENDPROG.READY,SENDPROG.READY];
            actions.clearQnaReturns();
        } 
        App.pub_stop();
        App.pub_playBtnTab();
        felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
        this._curQidx = 0;
        this._tab = 'DICTATION';
        actions.setNavi(true, true);
    }

    private _clickScript = (ev: React.MouseEvent<HTMLElement>) => {
        const { actions ,state} = this.props;

        if (this._tab === 'SCRIPT') return;
        if (falsySended(state)) return;

        App.pub_stop();
        App.pub_playBtnTab();
        felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
        this._curQidx = 0;
        this._tab = 'SCRIPT';
        actions.setNavi(true, true);
        if(this._curQidx === 2) actions.setNavi(true, false);
    }
    
    private _sendDialogueEnd() {
		const msg: IMsg = {
			msgtype: 'script_end',
		};
		felsocket.sendPAD($SocketType.MSGTOPAD, msg);
	}

	/* 누른 학생만 보이게 하는 런쳐결과  수정안됨*/
	private _clickPerson = (idx: number) => {
        const quizResults = this.props.actions.getResult();
        App.pub_playBtnTab();
        if(!quizResults[this._curQidx]) return;

        if(idx === 1) felsocket.startStudentReportProcess($ReportType.JOIN, quizResults[this._curQidx].u1);
        else if(idx === 2) felsocket.startStudentReportProcess($ReportType.JOIN, quizResults[this._curQidx].u2);
	}
    
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
	private showResult = (ansboolean : boolean) => {
        App.pub_playBtnTab();
        this.answerboolean = ansboolean
		this._viewResult = true;
		this.props.actions.setNaviView(false);
    }    
	private _closeResult = () => {
		this._viewResult = false;
		this.props.actions.setNaviView(true);
	}
    
    private _TabSequence: ITabType[] = ['INTRODUCTION','CONFIRM','ADDITIONAL','DICTATION','SCRIPT'];

	private _setNavi() {
        const { state,actions } = this.props;
        actions.setNaviView(true);
        console.log('idx tab',this._curQidx,this._tab)
        if(this._curQidx === 0 && this._tab === 'INTRODUCTION') {actions.setNavi(false, true); console.log('idx tab1',this._curQidx,this._tab)}
        else if(this._curQidx === 2 && this._tab === 'SCRIPT') {actions.setNavi(true,false); console.log('idx tab2',this._curQidx,this._tab)}
        else {
            console.log('idx tab3',this._curQidx,this._tab)
            if(state.confirmBasicProg === SENDPROG.SENDED ||
                state.confirmSupProg === SENDPROG.SENDED ||
                state.confirmHardProg === SENDPROG.SENDED ||
                state.additionalBasicProg === SENDPROG.SENDED ||
                state.additionalSupProg === SENDPROG.SENDED ||
                state.additionalHardProg === SENDPROG.SENDED ||
                state.dictationProg.indexOf(SENDPROG.SENDED) !== -1) actions.setNavi(false,false);
            else actions.setNavi(true, true);
        }

        const __leftNaviFunc = () => {
            const tabIndex = this._TabSequence.indexOf(this._tab);
            if (tabIndex === 0) {
                if(this._curQidx === 0) actions.gotoDirection();
                else {
                    this._curQidx -= 1;
                    this._setNavi();
                }
            } else if (tabIndex > 0) {
                if(this._curQidx === 0) {
                    this._tab = this._TabSequence[tabIndex - 1]; 
                    this._curQidx = this.m_data.introduction.length - 1;
                } else {
                    this._curQidx -= 1;
                    this._setNavi();
                    felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
                }
            }
        };
        const __rightNaviFunc = () => {
            const tabIndex = this._TabSequence.indexOf(this._tab);
            if (tabIndex >= 0) {
                if(this._curQidx === 2) {
                    this._tab = this._TabSequence[tabIndex + 1];
                    this._curQidx = 0;
                } else {
                    this._curQidx += 1;
                    this._setNavi();
                }
            }
        };
        actions.setNaviFnc(__leftNaviFunc, __rightNaviFunc);
	}

	public componentDidUpdate(prev: IWritingProps) {
        const { view } = this.props;

        if (view && !prev.view) {
            this._clearAll();
            this._view = true;
            this._setNavi();
            this._letstalk = false;
            this._popTrans = false;
        } else if (!view && prev.view) {
            this.c_popup = 'off';
            this._focusIdx = -1;
            this._roll = '';
            this._isShadowPlay = false;
            this._shadowing = false;
            App.pub_stop();
        }
    }

	public render() {
        const { view, state, actions } = this.props;
        const { qnaProg } = state;

        const introductions = this.m_data.introduction;
        const dictations = [this.m_data.dictation_sup, this.m_data.dictation_basic, this.m_data.dictation_hard];
        const isOnStudy = (qnaProg >= SENDPROG.SENDING);

        const isCompI = (this._tab === 'INTRODUCTION');
        const isCompC = (this._tab === 'CONFIRM');
        const isCompA = (this._tab === 'ADDITIONAL');
        const isCompD = (this._tab === 'DICTATION');
        const isCompS = (this._tab === 'SCRIPT');
        const isViewSend = (!isCompI) &&
                            (isCompC && this._curQidx === 0 && state.confirmSupProg < SENDPROG.SENDED) ||
                            (isCompC && this._curQidx === 1 && state.confirmBasicProg < SENDPROG.SENDED) ||
                            (isCompC && this._curQidx === 2 && state.confirmHardProg < SENDPROG.SENDED) ||
                            (isCompA && this._curQidx === 0 && state.additionalSupProg < SENDPROG.SENDED) ||
                            (isCompA && this._curQidx === 1 && state.additionalBasicProg < SENDPROG.SENDED) ||
                            (isCompA && this._curQidx === 2 && state.additionalHardProg < SENDPROG.SENDED) ||
                            (isCompD && state.dictationProg[this._curQidx] < SENDPROG.SENDED) ||
                            (isCompS && state.scriptProg[this._curQidx] < SENDPROG.SENDED);
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
                <ToggleBtn className="btn_pop_trans" view={view && this._tab === 'SCRIPT'} on={this._popTrans} onClick={this._onPopTrans} />
                <TransPopup 
                    view={this._popTrans} 
                    data={this.m_data.scripts[this._curQidx]} 
                    onClosed={this._PopTransClosed}
                />
                <CheckResult 
                    view={this._viewResult}
                    answer={this.answerboolean}
                    tab = {this._tab}
                    idx = {this._curQidx}
                    state={this.props.state}
                    onClosed={this._closeResult}
			    />
                <div className="writing_content_box">
                    {/* index */}
                    <div className="btn_page_box">
                        {introductions.map((introduction, idx) => {
                            return <NItemW key={idx} tab={this._tab} on={idx === this._curQidx} idx={idx} onClick={this._onPage}/>;
                        })}
                    </div>
                    
                    <div className={'question'} style={{display: this._tab === 'INTRODUCTION' ? '' : 'none'}}>
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
                    <div className={'question'} style={{display: this._tab === 'CONFIRM' ? '' : 'none'}}>
                        <div key={1} >
                            <ConfirmQuiz index={this._curQidx} mdata={this.m_data} onClosed={this._letstalkClosed} onHintClick={this._clickConfirmAnswer} view={view} actions={actions} state={state} viewResult ={this.showResult} />                          
                        </div>              
                    </div>
                    <div className={'question'} style={{display: this._tab === 'ADDITIONAL' ? '' : 'none'}}>
                        <div key={1} >
                            <AdditionalQuiz view={view} actions={actions} state={state} index={this._curQidx} mdata={this.m_data} onClosed={this._letstalkClosed} onHintClick={this._clickAdditionalAnswer} viewResult ={this.showResult}/>                          
                        </div>               
                    </div>
                    <div className={'question'} style={{display: this._tab === 'DICTATION' ? '' : 'none'}}>
                        {dictations.map((dictation, idx) => {
                            return (
                            <div key={idx}>
                                <HardDictationQuizBox index={idx} data={dictation} onClosed={this._letstalkClosed} onHintClick={this._clickDictationAnswer} view={view && idx === this._curQidx} actions={actions} state={state} viewResult ={this.showResult} />                          
                            </div>
                            );
                        })}
                    </div>
                    {this.m_data.scripts.map((script, idx) => {
                        return (
                            <div key={idx} className={'script_container' + (this._tab === 'SCRIPT' && idx === this._curQidx ? '' : ' hide')} style={{display: this._tab === 'SCRIPT' ? '' : 'none'}}>
                                <ScriptAudio view={view && idx === this._curQidx && this._tab === 'SCRIPT'} state={state} actions={actions} idx={idx} script={script} />
                            </div>
                        );
                    })}
                </div>
                <SendUINew view={isViewSend} type={'teacher'} sended={false} originY={0} onSend={this.onSend}/>
                <CoverPopup className="pop_hint" view={this._viewpop} onClosed={() => {/**/}}>
                    <div className="pop_bg">
                        <ToggleBtn className="btn_close" onClick={() => this._onClosepop(null)}/>
                        <ToggleBtn className="btn_no" onClick={() => this._onClosepop(false)}/>
                        <ToggleBtn className="btn_yes"onClick={() => this._onClosepop(true)}/>
                        <div className="pop_msg"/>
                    
                    {/* </SwiperComponent> */}
                    </div>
                </CoverPopup>
            </div>
        );
    }
}

export default Writing;
