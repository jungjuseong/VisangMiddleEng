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
interface IControlBox {
	player: MPlayer;
	disable: boolean;
	isPlay: boolean;
	togglePlay: () => void;
}
@observer
class ControlBox extends React.Component<IControlBox> {
	public render() {
		const player = this.props.player;
		return (
			<div className="control">
				<div className="control_left">
					<ToggleBtn className="btn_play_pause" on={this.props.isPlay} onClick={this.props.togglePlay} />
				</div>
				<div className="control_top">
					<div>
						<ProgBox player={player} disable={this.props.disable}/>
					</div>
				</div>
			</div>
		);
	}
}

export default ControlBox;