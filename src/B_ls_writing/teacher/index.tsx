import * as React from 'react';
import { hot } from 'react-hot-loader/root';

import { observer, Observer } from 'mobx-react';
import * as _ from 'lodash';

import '../../font.scss';
import './index.scss';

import { Navi } from '../../share/navi';

import * as t_store from './t_store';
import { TeacherProvider, tContext } from './t_store';
import VideoDirection from '../../share/video-direction';
import { App } from '../../App';
import Writing from './t_writing';
import { render } from 'react-dom';

const _WIDTH = 1280;

interface ITeacherPageProps {
	state: t_store.IStateCtx;
	actions: t_store.IActionsCtx;
}


@observer
class TeacherPage extends React.Component<ITeacherPageProps> {

	public render() {	
		const { viewDiv,navi,directionON } = this.props.state;
		const {naviLeft,naviRight,onDirectionEndStart,onDirectionEnded} = this.props.actions;

		return (
			<>
			<div id="preload_hidden" style={{opacity: 0}}>
				<span>가나다라s</span><span style={{fontWeight: 'bold'}}>가나다라</span>
				<span className="set" /> <span className="unlimit" /> <span className="start" />
				<span className="time1" /><span className="time2" /> <span className="time3" />
			</div>
			<div className="content-container">
				<div className="content-wrapper" style={{left: (viewDiv === 'direction' ? 0 : -_WIDTH) + 'px'}}>
					<div>
						<VideoDirection className="video-direction" view={viewDiv === 'direction'} on={directionON} isTeacher={true} video_url={''} video_frame={125}	onEndStart={onDirectionEndStart} onEnd={onDirectionEnded}>
							<div className="lesson">{App.lesson}</div>
						</VideoDirection>
					</div>
					<div>
						<Writing view={viewDiv === 'content'}  state={this.props.state} actions={this.props.actions}/>
					</div>
				</div>
			</div>
			<Navi {...navi} onLeftClick={naviLeft} onRightClick={naviRight}/>
			</>
		);
	}	
}

const Teacher = t_store.useTeacher((teacherContext: t_store.TeacherContext) => (
	<Observer>
		{() => (<TeacherPage state={teacherContext.state} actions={teacherContext.actions}/>)}
	</Observer>
));

export { TeacherProvider as AppProvider, tContext as appContext };
export default hot(Teacher);