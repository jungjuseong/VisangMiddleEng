import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';

import { App } from '../../../App';
import * as felsocket from '../../../felsocket';

import * as common from '../../common';

import { SENDPROG, IStateCtx, IActionsCtx } from '../t_store';
import { IMsg,IData,IFocusMsg } from '../../common';
import { TimerState } from '../../../share/Timer';

import ScriptContainer from '../../script_container';
import VideoBox from '../t_video_box';

interface IScriptAudio {
	view: boolean;
	state: IStateCtx;
    actions: IActionsCtx;
    idx : number;
    script : common.IScript[]
}

@observer
class ScriptAudio extends React.Component<IScriptAudio> {
    private m_data: IData;
    
    private m_player = new MPlayer(new MConfig(true));
    private m_player_inittime = 0; // 비디오 시작시간 
	
	@observable private _tab: 'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT' = 'INTRODUCTION';

	@observable private _view = false;
	@observable private _curQidx = 0;
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
	
	public constructor(props: IScriptAudio) {
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
		//this._sendFocusIdx(idx);
    }
    private _sendFocusIdx(idx: number) {
		const msg: common.IFocusMsg = {
			msgtype: 'focusidx',
			idx,
		};
		felsocket.sendPAD($SocketType.MSGTOPAD, msg);
    }
    
    private _setShadowPlay = (val: boolean) => {
		if(this._shadowing) {
			this._isShadowPlay = val;
			const msg: common.IMsg = {
				msgtype: val ? 'playing' : 'paused',
			};
			felsocket.sendPAD($SocketType.MSGTOPAD, msg);
		} else this._isShadowPlay = val;
    }

    private _sendDialogueEnd() {
		const msg: common.IMsg = {
			msgtype: 'script_end',
		};
		felsocket.sendPAD($SocketType.MSGTOPAD, msg);
	}
	private _setNavi() {
        const { state,actions } = this.props;
        const { confirmBasicProg,qnaProg } = state;

        actions.setNaviView(true);
        if(this._curQidx === 0 && this._tab === 'INTRODUCTION') actions.setNavi(false, true);
        else if(confirmBasicProg === SENDPROG.SENDED) actions.setNavi(this._curQidx === 0 ? false : true, this._curQidx === this.m_data.introduction.length - 1 ? false : true);
		else actions.setNavi(true, true);
		
	}

	public componentDidUpdate(prev: IScriptAudio) {
        const { view } = this.props;

        if (view && !prev.view) {
            this._view = true;
            this._setNavi();
        } else if (!view && prev.view) {
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
            <div className="video_container">
				<VideoBox 
					player={this.m_player} 
					playerInitTime={this.m_player_inittime} 
                    data={this.m_data}
                    idx={idx}
					roll={this._roll}
					shadowing={this._shadowing}
					onChangeScript={this._onChangeScript}
					stopClick={this._stopClick}
					isShadowPlay={this._isShadowPlay}
					setShadowPlay={this._setShadowPlay}
				/>
			</div>
            <ScriptContainer
                ref={this._refScriptContainer}
                view={view}
                role={this.m_data.role_play}
                script={script}
                idx = {idx}
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
            </>
        );
    }
}

export default ScriptAudio;
