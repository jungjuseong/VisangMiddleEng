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
		let left = state.viewDiv === 'direction' ? 0 : -1280;
		console.log("attension 이름 변경 a => A");
		return (
			<>
			<div id="preload_hidden" style={{opacity: 0}}>
				<span>가나다라</span><span style={{fontWeight: 'bold'}}>가나다라</span>
			</div>
			<div className="content-container"><div className="content-wrapper" style={{left: left + 'px',}}>
				<div><VideoDirection 
							className="video-direction" 
							view={state.viewDiv === 'direction'} 
							on={state.directionON} 
							isTeacher={false}
							video_url={''}
							video_frame={125}
				/></div>
				<div>

					<SContent 
						view={state.viewDiv === 'content'} 
						qsMode={state.qsMode}
						scriptProg={state.scriptProg}
						state={state} 
						actions={actions}
					/>
					<Loading view={state.loading}/>
					<SVGAni 
						className="goodjob-svg" 
						view={state.goodjob} 
						delay={3000}
						data={`${_digenglishCB_lib_}images/goodjob.png`}
						onComplete={actions.goodjobComplete}
					/>
					<SVGEmbed 
						className="eyeon_svg" 
						data={`${_digenglishCB_lib_}images/Attention.png`}
						view={state.viewDiv === 'eyeon' || state.viewDiv === 'direction'}
						bPlay={false}
					/>
				</div>
			</div></div>

			</>
		);
	}
	

}
const Student = useStudent((store: StudentContext) => (
	<Observer>{() => (
		<StudentPage 
			state={store.state} 
			actions={store.actions}
		/>
	)}</Observer>
));
export { StudentProvider as AppProvider, sContext as appContext };
export default hot(module)(Student);