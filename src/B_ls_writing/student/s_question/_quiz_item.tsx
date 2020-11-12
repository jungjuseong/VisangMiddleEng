import * as React from 'react';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import QuizChoice from './_quiz_choice';

interface IQuizItem {
	view: boolean;
	idx: number;
	choice: number;
	quiz: common.IQuiz;
	questionProg: QPROG;
	onChoice: (idx: number, choice: number) => void;
}

class QuizItem extends React.Component<IQuizItem> {
	private _onChoice = (choice: number) => {
		this.props.onChoice(this.props.idx, choice);
	}
	public render() {
		const {view, idx, choice, quiz, questionProg} = this.props;
		const answer = quiz.answer;
		return (
			<>
				<div className="quiz"><div>
					<WrapTextNew 
						view={view}
					>
						{quiz.app_question}
					</WrapTextNew>
				</div></div>
				<div className="choice">
					{/* 예시:  <img src={App.data_url + data.item1.img} draggable={false}/> */}
					<img className="image" src="#"/>
					<img className="image" src="#"/>
					<img className="image" src="#"/>
				</div>
				<div className="box">
					<div className="num" draggable={true}><text>1</text></div>
					<div className="num" draggable={true}><text>2</text></div>
					<div className="num" draggable={true}><text>3</text></div>
				</div>
			</>		
		);
	}
}

export default QuizItem;