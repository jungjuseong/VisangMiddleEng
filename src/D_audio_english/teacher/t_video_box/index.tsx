import * as React from 'react';

import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable, } from 'mobx';

import { MPlayer, IMedia, MPRState } from '@common/mplayer/mplayer';

import { App } from '../../../App';
import { ToggleBtn } from '@common/component/button';
import { Loading } from '../../../share/loading';
import { CountDown2, TimerState } from '../../../share/Timer';
import Yourturn from '../../../share/yourturn';

import * as common from '../../common';

import ControlBox from './_control_box';
import CaptionBox from './_caption_box';
import { NONE } from 'src/share/style';


function _getCurrentIdx(scripts: common.IScript[], time: number) {
	let timeRound = Math.round(time / 0.001) * 0.001;
	// console.log('time:', time)
    for (let i = 0, len = scripts.length; i < len; i++) {
		// console.log('timeround:',timeRound)
        const s = scripts[i];
        if (timeRound >= s.audio_start && timeRound <= s.audio_end) {
			return i;		        
        } else if (timeRound < s.audio_start) {
            return -2;
        }
    }
    return -1;
}

interface IVideoBox {
    player: MPlayer;
    playerInitTime: number;  // 비디오 시작시간
	data: common.IData;
	idx: number;
	roll: ''|'A'|'B';
	shadowing: boolean;
	isShadowPlay: boolean;
	setShadowPlay: (val: boolean) => void;
	stopClick: () => void;
	onChangeScript: (idx: number) => void;
}
@observer
class VideoBox extends React.Component<IVideoBox> {
	private m_box!: HTMLElement;
	@observable private m_viewCaption = false;
	@observable private m_curIdx: number = -1;
	@observable private m_viewCountDown = false;
	@observable private m_yourturn = -1;
	@observable private m_ytNext = -1;

	private _refBox = (el: HTMLElement | null) => {
        if (this.m_box || !el) return;
        this.m_box = el;
	}

	private _refVideo = (el: HTMLMediaElement | null) => {
		if (!el) return;
		const { player } = this.props;
		if (player.media) return;
		player.mediaInited(el as IMedia);

		player.load(App.data_url + this.props.data.role_play.main_sound);
		const scripts = this.props.data.scripts[this.props.idx];
		player.addOnTime((time: number) => {
			time = time / 1000;
			const curIdx = _getCurrentIdx(scripts, time);
			console.log(curIdx);
			if(this.m_curIdx !== curIdx) {
				if(this.props.shadowing) {
					if(this.m_yourturn < 0) {
						if(this.m_curIdx >= 0) {
							this.m_ytNext = curIdx;
                            player.pause();
                            const script = scripts[this.m_curIdx];
                            const delay = (script.audio_end - script.audio_start) * 2000;
                            this.m_yourturn = _.delay(() => {
                                if(this.m_yourturn >= 0 && this.props.isShadowPlay) {
									this.m_curIdx = this.m_ytNext;
									this.m_yourturn = -1;
									if(curIdx != -1){
										this.props.onChangeScript(curIdx);
										player.play();
									}else{
										player.play();
										player.pause();
										this.props.onChangeScript(curIdx);
										return;
									}				
                                }
							}, delay); 
                            return;
						}
					} else {
						return;
					}
				}	
				this.m_curIdx = curIdx;
				console.log('onc',curIdx);
				this.props.onChangeScript(curIdx);
			}
		});
	}
	private _playClick = () => {
		App.pub_playBtnTab();
		this.props.player.play();
	}

	private _togglePlay = () => {
		const scripts = this.props.data.scripts[this.props.idx];
		if(this.m_viewCountDown) return;
		App.pub_playBtnTab();
		const player = this.props.player;
		if(	this.m_yourturn >= 0) {
			this.m_curIdx = this.m_ytNext;
			clearTimeout(this.m_yourturn);
			this.m_yourturn = -1;
		}
		if(this.props.shadowing) {
			let isShadowPlay = !this.props.isShadowPlay;
			this.props.setShadowPlay(isShadowPlay);

			if (isShadowPlay) player.play();
			else player.pause();
		} else {
			console.log(player.bPlay);
			if (player.bPlay) player.pause();
			else {
                if(player.currentTime >= player.duration || player.currentTime < this.props.playerInitTime*1000) {
					player.gotoAndPlay(this.props.playerInitTime *1000, scripts[scripts.length-1].audio_end * 1000, 1);	
				}else{
					player.gotoAndPlay(player.currentTime, scripts[scripts.length-1].audio_end * 1000, 1);
				}
            }
		}
	}

	private _countStart = () => {
		// console.log('_countStart');
	}
	private _countZero = () => {
        const { player, data, roll, shadowing} = this.props;
        this.m_viewCountDown = false;
        if(roll === '') return;

        if(player.currentTime !== this.props.playerInitTime 
            || player.currentTime < this.props.playerInitTime) player.seek(this.props.playerInitTime * 1000);
        player.play();
		
	}
	public componentDidUpdate(prev: IVideoBox) {
		const { player, data, roll, shadowing} = this.props;
		if(this.props.roll !== prev.roll) {
			if(	this.m_yourturn >= 0) {
				clearTimeout(this.m_yourturn);
				this.m_yourturn = -1;
			}
			this.props.setShadowPlay(false);
			if(this.props.roll === '') {
				player.pause();
				this.m_viewCountDown = false;
				
			} else {
                if(player.currentTime !== this.props.playerInitTime 
                    || player.currentTime < this.props.playerInitTime) player.seek(this.props.playerInitTime * 1000);
                this.m_curIdx = -1;
                player.pause();
                player.setMuted(false);
                this.m_viewCountDown = true;
			}
		}
		if(this.props.shadowing !== prev.shadowing) {
			if(	this.m_yourturn >= 0) {
				clearTimeout(this.m_yourturn);
				this.m_yourturn = -1;
			}
			
			this.props.setShadowPlay(this.props.shadowing);

			if(this.props.shadowing) {
                if(player.currentTime !== this.props.playerInitTime 
                    || player.currentTime < this.props.playerInitTime) player.seek(this.props.playerInitTime * 1000);
                this.m_curIdx = -1;
                player.play();
                
                player.setMuted(false);
			} else {
				player.pause();
			}
		}
	}
	public render() {
		const { player, data, roll, shadowing, isShadowPlay,idx} = this.props;
		const isOnRoll = roll === 'A' || roll === 'B';
		const viewLoading = !isOnRoll && !shadowing && (player.myState === MPRState.BUFFERING || player.myState === MPRState.LOADING);
		const viewBtnPlay = !isOnRoll && !shadowing && !player.bPlay;

		const isPlay = (!shadowing && player.bPlay) || (shadowing && this.props.isShadowPlay);

		return (
			<div className="video_box" ref={this._refBox}>
				<video ref={this._refVideo} style={{display : 'none'}}>
				</video>
				<ToggleBtn className="btn_audio" on={isPlay} onClick={this._togglePlay}/>
				
				{/* <Yourturn 
						className="yourturn" 
						view={this.m_yourturn >= 0 && isShadowPlay}
						start={this.m_yourturn >= 0}
					/> */}
				{/* <div className="video">
					<video controls={false} ref={this._refVideo} onClick={this._clickVideo} />
					<Loading view={viewLoading} />
					<CaptionBox view={this.m_viewCaption} script={script} />
					<CountDown2 state={this.props.countdown} view={this.m_viewCountDown} onStart={this._countStart}  onComplete={this._countZero}/>

			
				</div> */}
				<ControlBox
					player={player}
					disable={this.m_viewCountDown || shadowing}
					isPlay={isPlay}
					togglePlay={this._togglePlay}
				/>
			</div>
		);
	}
}

export default VideoBox;