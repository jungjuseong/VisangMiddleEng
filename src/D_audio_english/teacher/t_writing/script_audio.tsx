import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';

import { App } from '../../../App';
import * as felsocket from '../../../felsocket';

import { IScript, IFocusMsg, IRollMsg, IData, IMsg, IIndexMsg } from '../../common';

import { SENDPROG, IStateCtx, IActionsCtx } from '../t_store';

import ComprehensionPopup from './_comprehension_popup';
import ScriptContainer, { IScriptContainerProps } from '../../script_container';
import VideoBox from '../t_video_box';
import { ToggleBtn } from '@common/component/button';

interface IScriptAudioProps {
	view: boolean;
	state: IStateCtx;
    actions: IActionsCtx;
    idx: number;
    script: IScript[];
}

@observer
class ScriptAudio extends React.Component<IScriptAudioProps> {
    private m_data: IData;
    
    private m_player = new MPlayer(new MConfig(true));
    private m_player_inittime = this.props.script[0].audio_start; // 비디오 시작시간 
	
	@observable private _tab: 'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT' = 'SCRIPT';
    @observable private c_popup: 'off'|'Q&A' |'ROLE PLAY'|'SHADOWING' = 'off';
	@observable private _view = false;
	@observable private _viewClue = false;
	@observable private _viewTrans = false;
	@observable private _viewScript = false;

	@observable private _roll: ''|'A'|'B' = '';
	@observable private _shadowing = false;
	@observable private _focusIdx = -1;
    @observable private _isShadowPlay = false;
    
    private _lastFocusIdx = -1;

	private _selected: number[] = [];
	// private _rollProg: SENDPROG = SENDPROG.READY;
	private _scontainer?: ScriptContainer;
	
	public constructor(props: IScriptAudioProps) {
        super(props);
        this.m_data = props.actions.getData();
        this.m_player_inittime = this.props.script[0].audio_start;

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
            const msg: IMsg = {
                msgtype,
            };
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);
        });
    }
    
	public componentDidMount() {
		this.m_data = this.props.actions.getData();
    }

    // SCRIPT
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

    private _clickItem = (idx: number, script: IScript) => {
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

    private _stopClick = () => {
        this._sendFocusIdx(-1);
        this._lastFocusIdx = -1;
        this._focusIdx = -1;

        this.m_player.setMutedTemp(false);

        this._sendDialogueEnd();
        
        const isOnStudy = this._roll === 'A' || this._roll === 'B' || this._shadowing;
        
        this._isShadowPlay = false;
        if(!isOnStudy) this._setNavi();
    
	}

    private _onChangeScript = (idx: number) => {
        const scripts = this.m_data.scripts[this.props.idx];
        if(idx >= 0 && idx < scripts.length) {
            if(this._roll !== '' || this._shadowing) {
                const script = scripts[idx];
                if(this._roll !== '') {
                    this.m_player.setMutedTemp(this._roll === script.roll);
                }
            }
            this._lastFocusIdx = idx;
            this._focusIdx = idx;
        } else {
            this._focusIdx = -1;
            if(this._roll !== '') this.m_player.setMutedTemp(false);
        }
        this._sendFocusIdx(idx);
    }
    private _sendFocusIdx(idx: number) {
		const msg: IFocusMsg = {
			msgtype: 'focusidx',
            idx : this.props.idx,
            fidx : idx
		};
		felsocket.sendPAD($SocketType.MSGTOPAD, msg);
    }
    
    private _setShadowPlay = (val: boolean) => {
		if(this._shadowing) {
			this._isShadowPlay = val;
			const msg: IMsg = {
				msgtype: val ? 'playing' : 'paused',
			};
			felsocket.sendPAD($SocketType.MSGTOPAD, msg);
		} else this._isShadowPlay = val;
    }

    private _sendDialogueEnd() {
		const msg: IMsg = {
			msgtype: 'script_end',
		};
		felsocket.sendPAD($SocketType.MSGTOPAD, msg);
	}
	private _setNavi() {
        const { state,actions,idx } = this.props;
        const { confirmBasicProg } = state;

        actions.setNaviView(true);

        let enableLeft = true, enableRight = true;
        if(idx === 0 && this._tab === 'INTRODUCTION') enableLeft = false;
        else if(idx === 2 && this._tab === 'SCRIPT') enableRight = false;
        actions.setNavi(enableLeft, enableRight);		
    }

    private _toggleScript = () => {
		App.pub_playBtnTab();
		this._viewScript = !this._viewScript;
    }

    private _onQAClick = () => {
        const {state,actions} = this.props;

        // if(this.c_popup !== 'off') return;
        // else if(state.scriptProg < SENDPROG.SENDED) return;
        console.log('onQAcilck');

        if(state.qnaProg === SENDPROG.READY) {
            App.pub_playBtnTab();
            this.c_popup = 'Q&A';
            this.props.actions.setNavi(false, false);
        } else if(state.qnaProg >= SENDPROG.SENDING) {
            
            App.pub_playBtnTab();
            const msg: IIndexMsg = {
                msgtype: 'qna_end',
                idx:this.props.idx
            };
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);	
            state.qnaProg = SENDPROG.READY;	
            
            actions.clearQnaReturns();
            this._setNavi()
        }
    }
    private _onRollClick = () => {
        const {state,actions} = this.props;
        if(state.scriptProg[this.props.idx] >= SENDPROG.SENDED && !this._shadowing) {		
            App.pub_playBtnTab();
            if(this._roll === '') {
                this.c_popup = 'ROLE PLAY';
                this.m_player.pause();
                actions.setNavi(false, false);
            } else {
                this._lastFocusIdx = -1;
                this._focusIdx = -1;
                this.m_player.setMutedTemp(false);
                this._roll = '';
                this._sendDialogueEnd();
                this._setNavi()
            }
        }
    }

    private _onShadowClick = () => {
        const {state,actions} = this.props;
        // if(
        //     state.dialogueProg >= SENDPROG.SENDED && 
        //     this._roll === ''
        // ) {
        App.pub_playBtnTab();
        if(this._shadowing) {
            this._isShadowPlay = false;
            this._shadowing = false;
            actions.setNavi(true, true);
        } else {
            this._lastFocusIdx = -1;
            this._focusIdx = -1;
            this._sendFocusIdx(-1);
            this.c_popup = 'SHADOWING';
            this.m_player.pause();	
            this._sendDialogueEnd();
            this._setNavi()	
        // }
        }
    }
    
    private _onPopupSend = (roll: ''|'A'|'B') => {
        const {state, actions,idx} = this.props;
        if(this.c_popup === 'Q&A') {
            if(state.qnaProg > SENDPROG.READY) return;

            state.qnaProg = SENDPROG.SENDING;
            App.pub_playToPad();

            let msg: IIndexMsg = {msgtype: 'qna_send',idx};
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);

            // this._viewClue = false;
            _.delay(() => {
                if(state.qnaProg !== SENDPROG.SENDING) return;

                state.qnaProg = SENDPROG.SENDED;
            }, 300);
            
            
        } else if(this.c_popup === 'ROLE PLAY') {
            if(state.scriptProg[this.props.idx] !== SENDPROG.SENDED) return;
            else if(this._roll !== '' || roll === '') return;

            if(this.m_player.currentTime !== this.m_player_inittime
                || this.m_player.currentTime < this.m_player_inittime) this.m_player.gotoAndPause(this.m_player_inittime * 1000);
            App.pub_playToPad();

            this._lastFocusIdx = 0;
            this._focusIdx = -1;
            this.m_player.setMuted(false);
            this.m_player.setMutedTemp(false);
            let msg: IRollMsg = {msgtype: 'roll_send',idx:idx, roll};
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);
            _.delay(() => {
                if(state.scriptProg[this.props.idx] !== SENDPROG.SENDED) return;
                this._roll = roll;
            }, 300);

        } else if(this.c_popup === 'SHADOWING') {
            if(state.scriptProg[this.props.idx] !== SENDPROG.SENDED) return;
            if(this._shadowing) return;

            if(this.m_player.currentTime !== this.m_player_inittime
                || this.m_player.currentTime < this.m_player_inittime) this.m_player.gotoAndPause(this.m_player_inittime * 1000);
            App.pub_playToPad();

            this._lastFocusIdx = 0;
            this._focusIdx = -1;
            this.m_player.setMuted(false);
            this.m_player.setMutedTemp(false);

            let msg: IMsg = {msgtype: 'shadowing_send'};
            felsocket.sendPAD($SocketType.MSGTOPAD, msg);
            _.delay(() => {
                if(state.scriptProg[this.props.idx] !== SENDPROG.SENDED) return;
                this._shadowing = true;
            }, 300);
        }
        actions.setNavi(false, false);
    }

    private _onPopupClosed = () => {
        if(this._tab === 'SCRIPT' && this.props.state.qnaProg === SENDPROG.READY && this._roll === '' && !this._shadowing) this.props.actions.setNavi(true, true);
        this.c_popup = 'off';
    }

	public componentDidUpdate(prev: IScriptAudioProps) {
        const { view } = this.props;

        if (view && !prev.view) {
            this._view = true;
            this._setNavi();
            if(this.m_player.bPlay) this.m_player.pause();
        } else if (!view && prev.view) {
            if(this.m_player.bPlay) this.m_player.pause();
            this._lastFocusIdx = -1;
            this._focusIdx = -1;
            this._roll = '';
            this._isShadowPlay = false;
            this._shadowing = false;
            App.pub_stop();
        }
    }

	public render() {
        const { view, state,script,idx } = this.props;
        const { confirmBasicProg} = state;

        const isQComplete = confirmBasicProg >= SENDPROG.COMPLETE;
        let qResult = -1;        
        if(isQComplete) {
            qResult = 0;
            if(qResult > 100) qResult = 100;
        }
        return (
            <>
            <ToggleBtn className={'btn_script_show' + (this._viewScript ? ' on' : '')} on={this._viewScript} onClick={this._toggleScript} />
            <div className="video_container">
				<VideoBox
                    data={this.m_data}
                    idx={idx}
                    isShadowPlay={this._isShadowPlay}
                    onChangeScript={this._onChangeScript}
                    player={this.m_player} 
                    playerInitTime={this.m_player_inittime} 
                    roll={this._roll}
                    setShadowPlay={this._setShadowPlay}
                    shadowing={this._shadowing}
                    stopClick={this._stopClick}
				/>
			</div>
            <ScriptContainer
                ref={this._refScriptContainer}
                view={view}
                role={this.m_data.role_play}
                script={script}
                idx={idx}
                focusIdx={this._focusIdx}
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
            <div className="bottom">
                <ToggleBtn className="btn_QA"  view={view} on={state.qnaProg >= SENDPROG.SENDING} disabled={state.scriptProg[this.props.idx] < SENDPROG.SENDED } onClick={this._onQAClick} />
                <ToggleBtn className="btn_role" view={view} on={this._roll === 'A' || this._roll === 'B'} disabled={state.scriptProg[this.props.idx] < SENDPROG.SENDED } onClick={this._onRollClick} />
                <ToggleBtn className="btn_shadowing" view={view} on={this._shadowing} disabled={state.scriptProg[this.props.idx] < SENDPROG.SENDED } onClick={this._onShadowClick} />
            </div>
            <ComprehensionPopup 
                type={this.c_popup}
                view={this.c_popup === 'Q&A' || this.c_popup === 'ROLE PLAY' || this.c_popup === 'SHADOWING' } 
                imgA={this.m_data.role_play.speakerA.image_l}
                imgB={this.m_data.role_play.speakerB.image_l}
                onSend={this._onPopupSend}
                onClosed={this._onPopupClosed}
            />
            </>
        );
    }
}

export default ScriptAudio;
