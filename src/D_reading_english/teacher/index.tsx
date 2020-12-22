import * as React from 'react';
import { observer, Observer } from 'mobx-react';
import { hot } from 'react-hot-loader/root';
import * as _ from 'lodash';

import '../../font.scss';
import './index.scss';

import { Navi } from '../../share/navi';

import { TeacherProvider, tContext, IStateCtx, IActionsCtx, useTeacher, TeacherContext } from './t_store';
import VideoDirection from '../../share/video-direction';
import { App } from '../../App';
import TComprehension from './t_comprehension';

const _WIDTH = 1280;

interface ITeacher {
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class Comp extends React.Component<ITeacher> {
	constructor(props: ITeacher) {
		super(props);
	}
	public render() {
		const {state, actions} = this.props;
		const viewDiv = state.viewDiv;
		return (
			<>
				<div id="preload_hidden" style={{opacity: 0}}>
					<span>가나다라abc</span><span style={{fontWeight: 'bold'}}>가나다라a</span>
					<span className="set" /> <span className="unlimit" /> <span className="start" />
					<span className="time1" /><span className="time2" /> <span className="time3" />
				</div>
				{/*
				<SVGBg 
					className="bg_svg" 
					data="/content/digenglishCB_lib/images/theme0_bg.svg" 
					{...state.svg_bg}
				/>
				*/}
				<div className="content-container">
					<div className="content-wrapper" style={{left: (viewDiv === 'direction' ? 0 : -_WIDTH) + 'px'}}>
						<div><VideoDirection 
							className="video-direction" 
							view={viewDiv === 'direction'} 
							on={state.directionON} 
							isTeacher={true}
							video_url={_digenglishCB_lib_ + 'direction/reading_english.webp'}
							video_frame={125}
							onEndStart={actions.onDirectionEndStart}
							onEnd={actions.onDirectionEnded}
							>

						</VideoDirection></div>
						<div><TComprehension view={viewDiv === 'content'}  state={state} actions={actions}/></div>
					</div>
				</div>

				<Navi {...state.navi} onLeftClick={actions.naviLeft} onRightClick={actions.naviRight}/>
								
			</>
		);
	}
}
const Teacher = useTeacher((val: TeacherContext) => (
	<Observer>{() => (
		<Comp state={val.state} actions={val.actions}/>
	)}</Observer>
));

export { TeacherProvider as AppProvider, tContext as appContext };
export default hot(Teacher);
