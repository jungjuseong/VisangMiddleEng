import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { MPlayer } from '@common/mplayer/mplayer';
import { ToggleBtn } from '@common/component/button';

import ProgBox from './ProgBox';
/*
	roll: ''|'A'|'B';
	shadowing: boolean;
	viewCountDown: boolean;
*/
interface IControlBoxProps {
	player: MPlayer;
	viewCaption: boolean;
	disable: boolean;
	isPlay: boolean;
	toggleMute: () => void;
	toggleFullscreen: () => void;
	toggleCaption: () => void;
	togglePlay: () => void;
	stopClick: () => void;
	prevClick: () => void;
	nextClick: () => void;
}

function ControlBox(props: IControlBoxProps) {
	const { player, isPlay, disable, viewCaption,togglePlay, toggleMute, prevClick, nextClick, toggleCaption, stopClick, toggleFullscreen, } = props;
	return (
		<div className="control">
			<div className="control_left">
				<ToggleBtn className="btn_play_pause" on={isPlay} onClick={togglePlay} />
				<ToggleBtn className="btn_stop" onClick={stopClick} />
				<ToggleBtn className="btn_prev" onClick={prevClick} />
				<ToggleBtn className="btn_next" onClick={nextClick} />
			</div>
			<div className="control_top">
				<div>
					<ProgBox player={player} disable={disable}/>
				</div>
			</div>
			{/* btn_subscript, btn_audio 추가*/}
			<div className="control_right">
				<ToggleBtn className="btn_subscript" on={viewCaption} onClick={toggleCaption} />
				<ToggleBtn className="btn_audio" onClick={toggleMute} on={player.muted} />
				<ToggleBtn className="btn_fullscreen" onClick={toggleFullscreen} />
				<ToggleBtn className="btn_fullscreen_off" onClick={toggleFullscreen} />
			</div>
		</div>
	);
}

export default ControlBox;