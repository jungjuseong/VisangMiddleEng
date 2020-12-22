import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { MPlayer } from '@common/mplayer/mplayer';
import { ToggleBtn } from '@common/component/button';

import ProgBox from './_prog_box';
import { App } from 'src/App';
/*
	roll: ''|'A'|'B';
	shadowing: boolean;
	viewCountDown: boolean;
*/
interface IControlBox {
	player: MPlayer;
	disable: boolean;
	isPlay: boolean;
	togglePlay: () => void;
	view: boolean;
}
@observer
class ControlBox extends React.Component<IControlBox> {
	public render() {
		const {player, view, disable, isPlay, togglePlay} = this.props;
		return (
			<div className="control" style={{display : (view ? '' : 'none')}}>
				<div className="control_over">
					<div className="brake_point one"></div>
					<div className="brake_point two"></div>
				</div>
				<div className="control_left">
					<ToggleBtn className="btn_play_pause" on={isPlay} onClick={togglePlay} />
				</div>
				<div className="control_top">
					<div>
						<ProgBox player={player} disable={disable}/>
					</div>
				</div>
			</div>
		);
	}
}

export default ControlBox;