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
import Comprehension from './t_comprehension';
import * as felsocket from '../../felsocket';
import { ToggleBtn } from '@common/component/button';

const _WIDTH = 1280;

interface ITeacher {
	state: t_store.IStateCtx;
	actions: t_store.IActionsCtx;
}

@observer
class TeacherPage extends React.Component<ITeacher> {
	constructor(props: ITeacher) {
		super(props);

		// console.log('==>', props.actions.getData());
	}
	
    private _goToIntro = () => {
        felsocket.sendLauncher($SocketType.CLOSE_OTHER_BOOK, null);
        return;
    }

	public render() {
		const {state, actions} = this.props;
		const viewDiv = state.viewDiv;
		return (
			<>
				<div id="preload_hidden" style={{opacity: 0}}>
					<span>가나다라s</span><span style={{fontWeight: 'bold'}}>가나다라</span>
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
							video_url={_digenglishCB_lib_ + 'direction/ls_comprehension.webp'}
							video_frame={125}
							onEndStart={actions.onDirectionEndStart}
							onEnd={actions.onDirectionEnded}
						>
						</VideoDirection></div>
						<div><Comprehension view={viewDiv === 'content'}  state={state} actions={actions}/></div>
					</div>
				</div>

				<Navi {...state.navi} onLeftClick={actions.naviLeft} onRightClick={actions.naviRight}/>
				                
                <div className="close_box">
                    <ToggleBtn className="btn_intro" onClick={this._goToIntro}/>
                </div>
			</>
		);
	}
}
const Teacher = t_store.useTeacher((val: t_store.TeacherContext) => (
	<Observer>{() => (
		<TeacherPage state={val.state} actions={val.actions}/>
	)}</Observer>
));

export { TeacherProvider as AppProvider, tContext as appContext };
export default hot(Teacher);