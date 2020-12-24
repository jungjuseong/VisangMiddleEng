import * as React from 'react';

import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable, } from 'mobx';

import { MPlayer, IMedia } from '@common/mplayer/mplayer';

import { App } from '../../../App';
import { ToggleBtn } from '@common/component/button';
import Yourturn from '../../../share/yourturn';

import { IScript,IData } from '../../common';

import ControlBox from './_control_box';

function _getCurrentIdx(scripts: IScript[], time: number) {
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

interface IVideoBoxProps {
    player: MPlayer;
    playerInitTime: number;  // 비디오 시작시간
	data: IData;
	idx: number;
	roll: ''|'A'|'B';
	shadowing: boolean;
	isShadowPlay: boolean;
	setShadowPlay: (val: boolean) => void;
	stopClick: () => void;
	onChangeScript: (idx: number) => void;
	view? :boolean;
}
@observer
class VideoBox extends React.Component<IVideoBoxProps> {
	private m_box!: HTMLElement;
	@observable private m_curIdx: number = -1;
	@observable private m_viewCountDown = false;
	@observable private m_yourturn = -1;
	@observable private m_ytNext = -1;
	@observable private _view_audio_box: boolean = false;

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
			const {shadowing, isShadowPlay, onChangeScript} = this.props;
			time = time / 1000;
			const curIdx = _getCurrentIdx(scripts, time);
			console.log(curIdx);
			if(this.m_curIdx !== curIdx) {
				if(shadowing) {
					if(this.m_yourturn < 0) {
						if(this.m_curIdx >= 0) {
							this.m_ytNext = curIdx;
                            player.pause();
                            const script = scripts[this.m_curIdx];
                            const delay = (script.audio_end - script.audio_start) * 2000;
                            this.m_yourturn = _.delay(() => {
                                if(this.m_yourturn >= 0 && isShadowPlay) {
									this.m_curIdx = this.m_ytNext;
									this.m_yourturn = -1;
									if(curIdx != -1){
										onChangeScript(curIdx);
										player.play();
									}else{
										player.play();
										player.pause();
										onChangeScript(curIdx);
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
				onChangeScript(curIdx);
			}
		});
	}
	private _playClick = () => {
		App.pub_playBtnTab();
		this._togglePlay();
		this._view_audio_box = !this._view_audio_box;
		if (!this._view_audio_box) this.props.player.pause();
		else this.props.player.play();
	}

	private _playPointClick = (cnum : number) => {
		const {data, idx, player} = this.props;
		const scripts = data.scripts[cnum];
		if(this.m_viewCountDown) return;
		player.gotoAndPlay(scripts[0].audio_start * 1000, scripts[scripts.length - 1].audio_end * 1000, 1);
	}

	private _togglePlay = () => {
		const { data,shadowing, player,setShadowPlay, playerInitTime, isShadowPlay } = this.props;
		const scripts = data.scripts[this.props.idx];
		if(this.m_viewCountDown) return;
		App.pub_playBtnTab();
		if(	this.m_yourturn >= 0) {
			this.m_curIdx = this.m_ytNext;
			clearTimeout(this.m_yourturn);
			this.m_yourturn = -1;
		}
		if(shadowing) {
			setShadowPlay(!isShadowPlay);
			if (isShadowPlay) player.pause();
			else player.play();
		} else {
			console.log(player.bPlay);
			if (player.bPlay) player.pause();
			else {
				const playTime = (player.currentTime >= player.duration || player.currentTime < playerInitTime * 1000) ? playerInitTime * 1000 : player.currentTime;
				player.gotoAndPlay(playTime, scripts[scripts.length - 1].audio_end * 1000, 1);				
            }
		}
	}

	public componentDidUpdate(prev: IVideoBoxProps) {
		const { data, player, roll, shadowing,playerInitTime,setShadowPlay} = this.props;
		const scripts = data.scripts[this.props.idx];
		if(roll !== prev.roll) {
			if(	this.m_yourturn >= 0) {
				clearTimeout(this.m_yourturn);
				this.m_yourturn = -1;
			}
			this.props.setShadowPlay(false);
			if(roll === '') {
				player.pause();
				this.m_viewCountDown = false;				
			} else {
                if(player.currentTime !== playerInitTime || player.currentTime < playerInitTime) player.seek(playerInitTime * 1000);
                this.m_curIdx = -1;
                player.pause();
				player.setMuted(false);
				if(player.currentTime !== this.props.playerInitTime 
					|| player.currentTime < this.props.playerInitTime) player.seek(this.props.playerInitTime * 1000);
				player.gotoAndPlay(playerInitTime * 1000, scripts[scripts.length - 1].audio_end * 1000, 1);	
			}
		}
		if(shadowing !== prev.shadowing) {
			if(	this.m_yourturn >= 0) {
				clearTimeout(this.m_yourturn);
				this.m_yourturn = -1;
			}			
			setShadowPlay(shadowing);
			if(shadowing) {
                if(player.currentTime !== playerInitTime || player.currentTime < playerInitTime) player.seek(playerInitTime * 1000);
                this.m_curIdx = -1;
                player.play();                
                player.setMuted(false);
			} else player.pause();
		}
	}
	public render() {
		const { player, shadowing, isShadowPlay } = this.props;
		const isPlay = (!shadowing && player.bPlay) || (shadowing && isShadowPlay);

		return (
			<>
			<div className="video_box" ref={this._refBox}>
				<video ref={this._refVideo} style={{display : 'none'}}/>
				<div className="audio">
					<ToggleBtn className="btn_audio" on={isPlay} onClick={this._playClick}/>
					<ControlBox
						player={player}
						disable={this.m_viewCountDown || shadowing}
						isPlay={isPlay}
						togglePlay={this._togglePlay}
						view={this._view_audio_box}
						pointClick={this._playPointClick}
					/>
				</div>

			</div>
			<Yourturn 
			className="yourturn" 
			view={this.m_yourturn >= 0 && isShadowPlay}
			start={this.m_yourturn >= 0}
			/>
			</>
		);
	}
}

export default VideoBox;