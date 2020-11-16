import * as React from 'react';

import { Observer, observer } from 'mobx-react';
import { StudentContext, useStudent, IStateCtx, IActionsCtx } from './s_store';
import { IWordData, TypeQuiz } from '../common';

import QuizSound from '../sound_quiz';
import QuizMeaning from '../meaning_quiz';
import QuizSpelling from '../quiz_spelling';
import QuizUsage from '../usage_quiz';
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
class SQuizComp extends React.Component<IQuiz> {
	private _quizs: IWordData[] = [];
	private _quizType: TypeQuiz = '';
	private _isGroup = false;
	private _quizTime = 60;

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

			for(let i = 0; i < info.quizIndices.length; i++) {
				const word = words[info.quizIndices[i]];
				word.app_result = false;
				this._quizs[i] = word;
			}
			this._quizType = info.quizType;
			this._isGroup = next.state.isGroup;
			this._quizTime = info.quizTime;
		}
	}

	public render() {
		const {view, quizProg, state, groupProg, actions, qidx, forceStopIdx, groupResult} = this.props;

		const points = actions.getQuizInfo().points;

		let quizItem;
		if(this._quizType === 'sound') quizItem = QuizSound;
		else if(this._quizType === 'meaning') quizItem = QuizMeaning;
		else if(this._quizType === 'spelling') quizItem = QuizSpelling;
		else if(this._quizType === 'usage') quizItem = QuizUsage;		

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
				qtype={this._quizType}
				qtime={this._quizTime}
				points={points}
				ga_na={state.ga_na}
				startSelectedAni={state.startSelectedAni}
				quizs={this._quizs}
				ItemComponent={quizItem}
				unsetForceStop={actions.unsetForceStop}
				setQuizProg={actions.setQuizProg}
			/>			
		);
	}
}

const Quiz = useStudent((store: StudentContext) => (
	<Observer>{() => (
		<SQuizComp 
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
