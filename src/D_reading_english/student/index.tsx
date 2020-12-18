import * as React from 'react';
import { hot } from 'react-hot-loader/root';

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

import '../../font.scss';
import './index.scss';

import SWarmup from './s_warmup';
import SPassage from './s_passage';
import SQuestion from './s_question';
import SVScript from './s_v_script';

@observer
class Comp extends React.Component<{state: IStateCtx, actions: IActionsCtx}> {
	public render() {
		const {state, actions} = this.props;
		const { viewDiv,directionON,prog,viewTrans,qnaProg,focusSeq,focusIdx,goodjob } = state;
		let left = (viewDiv === 'direction') ? 0 : -1280;
		return (
			<>
			<div id="preload_hidden" style={{opacity: 0}}>
				<span>가나다라</span><span style={{fontWeight: 'bold'}}>가나다라</span>
			</div>
			<div className="content-container">
			<div className="content-wrapper" style={{left: left + 'px',}}>
				<div>
					<VideoDirection className="video-direction" view={viewDiv === 'direction'} on={directionON} isTeacher={false} video_url={_digenglishCB_lib_ + 'direction/reading_english.webp'} video_frame={125}/>
				</div>
				<div>
					<SWarmup view={viewDiv === 'content' && prog === 'warmup'} state={state} actions={actions}/>
					<SPassage view={viewDiv === 'content' && prog === 'passage'} viewTrans={viewTrans} qnaProg={qnaProg} focusSeq={focusSeq} state={state} actions={actions}/>
					<SQuestion view={viewDiv === 'content' && prog === 'question'} state={state} actions={actions}/>
					<SVScript view={viewDiv === 'content' && prog === 'v_script'} focusIdx={focusIdx} state={state} actions={actions}/>			
					<Loading view={state.loading}/>
					<SVGAni className="goodjob-svg" view={goodjob} delay={3000} data={`${_digenglishCB_lib_}images/goodjob_ls.svg`} onComplete={actions.goodjobComplete}/>
					<SVGEmbed className="eyeon_svg" data={`${_digenglishCB_lib_}images/eyeon_ls.svg`}	view={viewDiv === 'eyeon' || viewDiv === 'direction'} bPlay={false}/>
				</div>
			</div>
			</div>
			</>);
	}
}

const Student = useStudent((store: StudentContext) => (
	<Observer>{() => (
		<Comp 
			state={store.state} 
			actions={store.actions}
		/>
	)}</Observer>
));
export { StudentProvider as AppProvider, sContext as appContext };
export default hot(Student);