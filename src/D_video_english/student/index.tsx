import * as React from 'react';
import { hot } from 'react-hot-loader';

import { observer, Observer } from 'mobx-react';
import * as _ from 'lodash';

import { SVGEmbed, SVGAni } from '../../share/svg_object';
import VideoDirection from '../../share/video-direction';
import { 
	sContext, 
	StudentProvider, 
	StudentConsumer, 
	StudentContext, 
	useStudent, 
	IStateCtx,
	IActionsCtx
} from './s_store';

import { Loading } from '../../share/loading';
import SContent from './s_content';

import './index.scss';
import '../../font.scss';

@observer
class StudentPage extends React.Component<{state: IStateCtx, actions: IActionsCtx}> {
	public render() {
		const {state, actions} = this.props;
		const { goodjob, loading, qsMode, viewDiv,directionON,scriptMode,questionView,questionProg,scriptProg } = this.props.state;
		const leftOffset = viewDiv === 'direction' ? 0 : -1280;

		const videoProps = {
			video_url: _digenglishCB_lib_ + 'direction/ls_comprehension.webp',
			video_frame: 125
		};
		const modeProps = {	qsMode,	scriptMode,	questionView, questionProg, scriptProg,	state, actions };

		return (
			<>
			<div id="preload_hidden" style={{opacity: 0}}>
				<span>가나다라</span><span style={{fontWeight: 'bold'}}>가나다라</span>
			</div>
			<div className="content-container"><div className="content-wrapper" style={{left: leftOffset + 'px'}}>
				<div>
					<VideoDirection {...videoProps} className="video-direction" view={viewDiv === 'direction'} on={directionON} isTeacher={false}/>
				</div>
				<div>
					<SContent view={viewDiv === 'content'} {...modeProps} />
					<Loading view={loading}/>
					<SVGAni className="goodjob-svg" view={goodjob} delay={3000}	data={`${_digenglishCB_lib_}images/goodjob.png`} onComplete={actions.goodjobComplete}/>
					<SVGEmbed className="eyeon_svg" data={`${_digenglishCB_lib_}images/attention.png`}	view={viewDiv === 'eyeon' || viewDiv === 'direction'} bPlay={false}/>
				</div>
			</div></div>

			</>
		);
	}
}

const Student = useStudent((store: StudentContext) => (
	<Observer>
		{() => <StudentPage state={store.state} actions={store.actions}/>}
	</Observer>
));
export { StudentProvider as AppProvider, sContext as appContext };
export default hot(module)(Student);