import * as React from 'react';
import { observer } from 'mobx-react';

import { IStateCtx, IActionsCtx } from './t_store';
import { IWordData,TypeQuiz } from '../common';

import QuizSound from '../sound_quiz';
import QuizMeaning from '../meaning_quiz';
import QuizSpelling from '../quiz_spelling';
import QuizUsage from '../usage_quiz';
import QuizTeacher from '../../share/QuizTeacher';

interface IQuizProps {
	view: boolean;
	quizProg: TypeQuizProg;
	numOfReturn: number;
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class TQuiz extends React.Component<IQuizProps> {
	private _quizs: IWordData[] = [];
	private _quizType: TypeQuiz = '';
	private _quizTime: number = 0;

	public componentWillUpdate(next: IQuizProps) {
		if(next.view && !this.props.view) {
			while(this._quizs.length > 0) this._quizs.pop();

			const words = next.actions.getWords();
			let quizTime = 60;
			if(next.state.isGroup) {
				const group = next.actions.getGroupInfo();
				for(let i = 0; i < group.questions.length; i++) {
					const q = group.questions[i];
					this._quizs[i] = words[q.qidx];
				}
				quizTime = group.quizTime;
			} else {
				const single = next.actions.getSingleInfo();
				for(let i = 0; i < single.questions.length; i++) {
					const quiz = single.questions[i];
					this._quizs[i] = words[quiz.qidx];
				}
				quizTime = single.quizTime;
			}
			this._quizType = next.state.quizType;
			this._quizTime = quizTime;
		}
	}

	public render() {
		const {view, state, actions, quizProg, numOfReturn} = this.props;

		let quizItem;
		if(this._quizType === 'sound') quizItem = QuizSound;
		else if(this._quizType === 'meaning') quizItem = QuizMeaning;
		else if(this._quizType === 'spelling') quizItem = QuizSpelling;
		else if(this._quizType === 'usage') quizItem = QuizUsage;

		return (
			<QuizTeacher 
				view={view}
				className="t_quiz"
				quizProg={quizProg}
				numOfReturn={numOfReturn}
				isGroup={state.isGroup}
				quizTime={this._quizTime}
				numOfGa={state.gas.length}
				numOfNa={state.nas.length}
				hasPreview={state.hasPreview}
				quizs={this._quizs}
				ItemComponent={quizItem}
				quizType={this._quizType}
				getSingleInfo={actions.getSingleInfo}
				getGroupInfo={actions.getGroupInfo}
				setQIdx={actions.setQIdx}
				gotoQuizSelect={actions.gotoQuizSelect}
				setNaviView={actions.setNaviView}
				setNaviFnc={actions.setNaviFnc}
				setNavi={actions.setNavi}
				waitResult={actions.waitResult}
			/>
		);
	}
}
export default TQuiz;


