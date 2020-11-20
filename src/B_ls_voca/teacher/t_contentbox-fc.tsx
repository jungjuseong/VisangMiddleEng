import * as React from 'react';

import * as _ from 'lodash';

import { ToggleBtn } from '@common/component/button';
import { IStateCtx, IActionsCtx, TProg } from './t_store';
import { App } from '../../App';
import VocaList from './t_voca_list';
import QuizSelect from './t_quiz_select';
import Timer from './t_timer';
import TQuiz from './t_quiz';
import Grouping from './t_grouping';
import Board from './t_board';

import VideoDirection from '../../share/video-direction';

const _WIDTH = 1280;

interface IContentBoxProps {
	prog: TProg;
	state: IStateCtx;
	actions: IActionsCtx;
}

function ContentBox({prog,state,actions}: IContentBoxProps) {
	
	const [ _idx, setIdx] = React.useState(0);
	const [ _sub_idx, setSubIdx] = React.useState(0);

	let _bRapid_sub = false;
	let _grouping: React.CSSProperties = {};
	let _timer: React.CSSProperties = {};
	let _board: React.CSSProperties = {};
	
	const _gotoIntroPage = () => alert('go to Intro page');

	const first_render = React.useRef(true);

	React.useEffect(() => {
		let index = 0;
		let sub_index = 0;

		if (first_render.current) {
			first_render.current = false;

			console.log('first_render');

			if(state.isGroup) {
				_grouping.display = '';
				_board.display = '';
				_grouping.opacity = (prog === 'grouping') ? 1 : 0;
				_timer.opacity = (prog === 'timer') ? 1 : 0;
				_board.opacity = (prog === 'board') ? 1 : 0;
			} else {
				_grouping.display = 'none';
				_board.display = 'none';
				_timer.opacity = (prog === 'timer') ? 1 : 0;
			}
			return;
		}
		console.log('useEffect:',prog);

		if(state.isGroup) {
			switch (prog) {
				case 'list': 
					index = 1; 
					sub_index = 0; 
					break;
				case 'quiz-select': 
					index = 2; 
					sub_index = 0; 
					break;
				case 'grouping': 
					index = 3; 
					sub_index = 0; 
					break;
				case 'timer': 
					index = 3; 
					sub_index = 1; 
					break;
				case 'board': 
					index = 3; 
					sub_index = 2; 
					break;						
				case 'quiz': 
					index = 3; 
					sub_index = 3; 
					break;
				default:
					break;
			}
		} else {
			switch (prog) {
				case 'list': index = 1; sub_index = 0; break;
				case 'quiz-select': index = 2; sub_index = 0; break;
				case 'timer': index = 3; sub_index = 0; break;
				case 'quiz': index = 3; sub_index = 1; break;
				default: break;
			}
		}
		if(_idx !== index) {
			const pidx = _idx;
			setIdx(index);
			if(_sub_idx !== sub_index) {
				_bRapid_sub = sub_index > _sub_idx;

				if(_bRapid_sub) {
					setSubIdx(sub_index);
				} else {
					const pidx_sub = _sub_idx;
					_.delay(() => {
						if(_idx === index && _sub_idx === pidx_sub) {
							setSubIdx(sub_index);
						}
					}, 300);
				}	
			} else _bRapid_sub = false;
		} else if(_sub_idx !== sub_index) {
			_bRapid_sub = false;
			setSubIdx(sub_index);
		}		
	}, [prog]);

	const style_sub: React.CSSProperties = {
		left: (-_sub_idx * _WIDTH) + 'px',
		transitionDelay: _bRapid_sub ? '0s' : '',
	};

	return (
		<div className={'content-container'}>
			<div className="close_box">
				<ToggleBtn className="btn_intro" onClick={_gotoIntroPage}/>
			</div>
			<div className="content-wrapper" style={{left: (-_idx * _WIDTH) + 'px'}}>
				<div>
					<VideoDirection 
						className="video-direction"
						view={state.viewDiv === 'direction'} 
						on={state.directionON} 
						isTeacher={true}
						video_url={_digenglish_lib_ + 'direction/ls_rw_voca.webp'}
						video_frame={125}
						onEndStart={actions.onDirectionEndStart}
						onEnd={actions.onDirectionEnded}
					>
						<div className="lesson">{App.lesson}</div>
					</VideoDirection>
				</div>
				<div>
					<VocaList view={prog === 'list'} state={state} actions={actions}/>
				</div>
				<div>
					<QuizSelect view={prog === 'quiz-select'} state={state} actions={actions}/>
				</div>
				<div className="sub-container">
					<div className="sub-wrapper" style={style_sub}>
						<div style={{..._grouping}}>
							<Grouping view={prog === 'grouping'} state={state} actions={actions}/>
						</div>
						<div style={{..._timer}}>
							<Timer view={prog === 'timer'} state={state} actions={actions}/>
						</div>
						<div style={{..._board}}>
							<Board view={prog === 'board'} numOfReturn={state.numOfReturn} state={state} actions={actions}/>
						</div>
						<div>
							<TQuiz view={prog === 'quiz'} quizProg={state.quizProg} numOfReturn={state.numOfReturn} state={state} actions={actions}/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ContentBox;