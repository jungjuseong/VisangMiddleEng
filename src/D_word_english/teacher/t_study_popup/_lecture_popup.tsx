import * as React from 'react';
import * as _ from 'lodash';

import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';
import { IWordData } from '../../common';
import { CoverPopup } from '../../../share/CoverPopup';
import { POPUP_TYPE } from '../t_voca_detail';
import { ResponsiveText } from '../../../share/ResponsiveText';
import { MPlayer, MConfig, IMedia } from '@common/mplayer/mplayer';

interface ILecturePopupProps {
	type: POPUP_TYPE;
	view: boolean; 
	word: IWordData|null;
	onClosed: () => void;
}

@observer
class LecturePopup extends React.Component<ILecturePopupProps> {
	@observable private _view = false;
	private _player: MPlayer = new MPlayer(new MConfig(true));

	private _onClose = () => {
		this._view = false;
		App.pub_playBtnTab();
		App.pub_stop();
		this._player.pause();
		this._player.unload();
	}
	
	private _refVideo = (el: HTMLVideoElement|null) => {
		if(this._player.media || !el) return;
		this._player.mediaInited(el as IMedia);
	}	

	private _onPause = () => {
		if(this._player.bPlay) this._player.pause();
		else if(!this._player.bPlay) this._player.play(); // p.26 수정
	}
	private _onPlay = () => {
		if(!this._player.bPlay) this._player.play();
	}
	public componentDidUpdate(prev: ILecturePopupProps) {
		const { view, word, type} = this.props;
		if(view && !prev.view) {
			this._view = true;
			if(word) {
				let url = '';
				let start = -1;
				let end = -1;
				if(type === 'sound') {
					url = word.video;
					start = word.sound_start;
					end = word.sound_end;
				} else if(type === 'meaning') {
					url = word.video;
					start = word.meaning_start;
					end = word.meaning_end;
				} else if(type === 'usage') {
					url = word.video;
					start = word.sentence_start;
					end = word.sentence_end;
				} else if(type === 'main video') {
					url = word.usage_video;
					start = word.usage_start;
					end = word.usage_end;
				}
				
				if(start >= 0) {
					this._player.setStartEndTime(start * 1000, end * 1000);
					this._player.load(App.data_url + url);
					this._player.play();
				}
				// this._player.play();
			}
		} else if(!view && prev.view) {
			this._player.unload();
			this._view = false;
		}
	}

	public render() {
		const { type, view, word, onClosed } = this.props;
		const entry = word ? word.entry : '';
		return (
			<CoverPopup className="lecture_popup"  view={view && this._view} onClosed={onClosed} >
				<div className="nav">
					<span className="type">{type.toUpperCase()}</span>
					<div className="entry">{entry}</div>
					<ToggleBtn className="btn_close" onClick={this._onClose}/>
				</div>
				<div className={'video ' + type}>
					<video ref={this._refVideo} onClick={this._onPause}/>
					<ToggleBtn className={'btn_play' + (this._player.bPlay ? ' play' : '')}  onClick={this._onPlay}/>
					<ResponsiveText className={'USAGE_script ' + type} maxSize={32} minSize={32} lineHeight={120} length={entry.length}>
						<span>{word ? word.usage_script : ''}</span>
					</ResponsiveText>
				</div>
			</CoverPopup>
		);
	}
}

export default LecturePopup;