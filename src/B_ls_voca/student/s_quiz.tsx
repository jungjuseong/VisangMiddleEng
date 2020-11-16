import * as React from 'react';

import { Observer, observer } from 'mobx-react';
import { StudentContext, useStudent, IStateCtx, IActionsCtx } from './s_store';
import { IWordData, TypeQuiz } from '../common';

import QuizSound from '../quiz_sound';
import QuizMeaning from '../quiz_meaning';
import QuizSpelling from '../quiz_spelling';
import QuizUsage from '../quiz_usage';
import QuizStudent from '../../share/QuizStudent';

interface IQuiz {
	view: boolean;
	quizProg: TypeQuizProg;
	qidx: number;
	forceStopIdx: number;
	groupProg: TypeGroupProg;
	groupResult: ''|'win'|'lose'|'tie';
	state: IStateCtx;
	actions: IActionsCtx;
}
@observer
class Comp extends React.Component<IQuiz> {
	private _quizs: IWordData[] = [];
	private _quiztype: TypeQuiz = '';
	private _isGroup = false;
	private _qtime = 60;

	public componentWillUpdate(next: IQuiz) {
		let bReset = false;
		if(next.view && !this.props.view) {
			bReset = true;
		} else if(next.state.isGroup && next.groupProg === 'inited' && this.props.groupProg === 'initing') {
			bReset = true;
		}
		if(bReset) {
			while(this._quizs.length > 0) this._quizs.pop();

			const info = next.actions.getQuizInfo();
			const words = next.actions.getWords();
			let qtime = info.quizTime;

			for(let i = 0; i < info.quizIndices.length; i++) {
				const word = words[info.quizIndices[i]];
				word.app_result = false;
				this._quizs[i] = word;
			}
			this._quiztype = info.quizType;
			this._isGroup = next.state.isGroup;
			this._qtime = qtime;
		}
	}

	public render() {
		const {view, quizProg, state, groupProg, actions, qidx, forceStopIdx, groupResult} = this.props;

		const points = actions.getQuizInfo().points;

		let ItemComponent;
		if(this._quiztype === 'sound') ItemComponent = QuizSound;
		else if(this._quiztype === 'meaning') ItemComponent = QuizMeaning;
		else if(this._quiztype === 'spelling') ItemComponent = QuizSpelling;
		else if(this._quiztype === 'usage') ItemComponent = QuizUsage;		

		return (
			<QuizStudent
				view={view}
				className="s_quiz"
				isGroup={this._isGroup}
				quizProg={state.quizProg}
				qidx={qidx}
				forceStopIdx={forceStopIdx}
				groupProg={groupProg}
				groupResult={groupResult}
				qtype={this._quiztype}
				qtime={this._qtime}
				points={points}
				ga_na={state.ga_na}
				startSelectedAni={state.startSelectedAni}
				quizs={this._quizs}
				ItemComponent={ItemComponent}
				unsetForceStop={actions.unsetForceStop}
				setQuizProg={actions.setQuizProg}
			/>			
		);


	}
}

const Quiz = useStudent((store: StudentContext) => (
	<Observer>{() => (
		<Comp 
			view={store.state.viewDiv === 'content' && store.state.prog === 'quiz'}
			quizProg={store.state.quizProg}
			forceStopIdx={store.state.forceStopIdx}
			qidx={store.state.qidx}
			groupProg={store.state.groupProg}
			state={store.state} 
			actions={store.actions}
			groupResult={store.state.groupResult}
		/>
	)}</Observer>
));

export default Quiz;
