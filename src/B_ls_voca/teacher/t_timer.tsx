import * as React from 'react';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

import { App } from '../../App';
import * as felsocket from '../../felsocket';

import QuizNumTime from '../../share/QuizNumTime';

import { IStateCtx, IActionsCtx } from './t_store';
import { IQuizMsg } from '../common';

const limit = 50;

interface ITimer {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class Timer extends React.Component<ITimer> {
	private _numAll = 0;
	private _numStudied = 0;
	private _numAi = 0;

	private _setNavi() {
		this.props.actions.setNaviView(false);
		this.props.actions.setNavi(false, false);
	}

	public componentWillUpdate(next: ITimer) {
		const { view, actions} = this.props;

		if(next.view && !view) {
			const qtype = next.state.quizType;
			const hasPreview = next.state.hasPreview;
			const words = actions.getWords();
			this._numAll = words.length;
			let numStudied = 0;
			let numAi = 0;

			for(const word of words) {
				if(word.app_studied) numStudied++;
				if(hasPreview) { 
					if((qtype === 'sound' && word.app_sound <= limit) || (qtype === 'meaning' && word.app_meaning <= limit) ||
						(qtype === 'spelling' && word.app_spelling <= limit)	|| (qtype === 'usage' && word.app_sentence <= limit)
					) numAi++;
				}
			}
			this._numStudied = numStudied;
			this._numAi = numAi;
		}
	}
	
	public componentDidUpdate(prev: ITimer) {
		if(this.props.view && !prev.view) {
			this._setNavi();
		} 
	}

	private _onStart = (nqType: QUIZ_SELECT_TYPE, numOfQuiz: number, timeOfQuiz: number) => {
		const { view,state, actions } = this.props;
		App.pub_reloadStudents(() => {
			if(!view) return;
			if(timeOfQuiz <= 0) return;

			const words = actions.getWords();
			let arr: number[] = [];
			const qtype = state.quizType;
	
			for(let i = 0; i < words.length; i++) {
				const word = words[i];
				if(nqType === 'ai') {
					if( state.hasPreview 
						&& (	(qtype === 'sound' && word.app_sound <= limit)
							|| 	(qtype === 'meaning' && word.app_meaning <= limit)
							|| 	(qtype === 'spelling' && word.app_spelling <= limit)
							|| 	(qtype === 'usage' && word.app_sentence <= limit)
						)
					) arr.push(i);		
				
				} else if(nqType === 'studied' && word.app_studied) arr.push(i);
				else if(nqType === 'all') arr.push(i);
			}
			if(arr.length === 0) return;
	
			if(numOfQuiz <= arr.length) {
				const selects: number[] = [];
				while( selects.length < numOfQuiz) {
					const idx = Math.floor(arr.length * Math.random());
					if(idx < arr.length && selects.indexOf(arr[idx]) < 0) selects.push(arr[idx]);
				}
				arr = selects;
			}

			actions.setQuizInfo(arr, timeOfQuiz, this.props.state.isGroup);
			const msg: IQuizMsg = {
				msgtype: 'quiz',
				quizIndices: arr,
				quizTime: timeOfQuiz,
				quizType: qtype,
				isGroup: this.props.state.isGroup,
			};
			felsocket.sendPAD($SocketType.MSGTOPAD, msg);
			if(state.isGroup) {
				actions.setQuizProg('');
				state.prog = 'board';			
			} else {
				actions.setQuizProg('quiz');
				state.prog = 'quiz';
			}
		});
	}

	public render() {
		const {view, state, actions} = this.props;
		return (
			<QuizNumTime
				className="t_timer"
				view={view}
				title={state.quizType}
				numAll={this._numAll}
				numStudied={this._numStudied}
				numAi={this._numAi}
				gotoQuizSelect={actions.gotoQuizSelect}
				onStart={this._onStart}
			/>
		);
	}
}
export default Timer;


