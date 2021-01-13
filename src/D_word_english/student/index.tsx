import * as React from 'react';
import { hot } from 'react-hot-loader/root';

import { observer, Observer } from 'mobx-react';
import * as _ from 'lodash';

import { SVGBg, SVGEmbed, SVGAni } from '../../share/svg_object';
import VideoDirection from '../../share/video-direction';

import { sContext, StudentProvider, StudentContext, useStudent, IStateCtx, IActionsCtx } from './s_store';

import { Loading } from '../../share/loading';

import SQuiz from './s_quiz';
import VocaTyping from './s_voca_typing';
import SSpeakRecord from './s_speak_record';

import './index.scss';
import '../../font.scss';

@observer
class StudentComponent extends React.Component<{state: IStateCtx, actions: IActionsCtx}> {
	public render() {
		const { actions } = this.props;
		const { viewDiv,svg_bg,directionON,loading,goodjob } = this.props.state;
		const leftOffset = viewDiv === 'direction' ? 0 : -1280;
		const vdProps = {
			view: viewDiv === 'direction',
			on: directionON,
			isTeacher: false,
			video_url: _digenglishCB_lib_ + 'direction/ls_rw_voca.webp',
			video_frame: 125 
		};
		console.log("view Div",viewDiv);
		return (
			
			<>
			<div id="preload_hidden">
				<span>가나다라</span><span style={{fontWeight: 'bold'}}>가나다라</span>
			</div>
			<SVGBg className="bg_svg" data="/content/digenglishCB_lib/images/theme0_bg.svg" {...svg_bg} />
			<div className="content-container"><div className="content-wrapper" style={{left: leftOffset + 'px',}}>
				<div>
					<VideoDirection className="video-direction" {...vdProps} />
				</div>
				<div>
					<SQuiz/>
					<VocaTyping />
					<SSpeakRecord />
					<Loading view={loading}/>
					<SVGAni className="goodjob-svg" view={goodjob} delay={2000}	data={`${_digenglishCB_lib_}images/goodjob.png`} onComplete={actions.goodjobComplete} />
					<SVGEmbed className="eyeon_svg" data={`${_digenglishCB_lib_}images/Attention.png`}	view={viewDiv === 'eyeon' || viewDiv === 'direction'} bPlay={false}	/>
				</div>
			</div></div>

			</>
		);
	}
}

const Student = useStudent((store: StudentContext) => (
	<Observer>{() => (
		<StudentComponent state={store.state} actions={store.actions}/>
	)}</Observer>
));
export { StudentProvider as AppProvider, sContext as appContext };
export default hot(Student);