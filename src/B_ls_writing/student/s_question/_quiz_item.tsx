import * as React from 'react';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import QuizChoice from './_quiz_choice';
import { App } from '../../../App';

interface IQuizItem {
	view: boolean;
	idx: number;
	choice: number;
	confirm_normal: common.IConfirmNomal;
	questionProg: QPROG;
	onChoice: (idx: number, choice: number) => void;
}

class QuizItem extends React.Component<IQuizItem> {
	private _onChoice = (choice: number) => {
		this.props.onChoice(this.props.idx, choice);
	}
	public render() {
		const {view, idx, choice, confirm_normal, questionProg} = this.props;
		return (
			<>
				<div className="quiz"><div>
					<WrapTextNew 
						view={view}
					>
						{confirm_normal.directive.kor}
					</WrapTextNew>
				</div></div>
				<div className="choice">
					{/* 예시:  <img src={App.data_url + data.item1.img} draggable={false}/> */}
					<img className="image" src={App.data_url + confirm_normal.item1.img}/>
					<img className="image" src={App.data_url + confirm_normal.item2.img}/>
					<img className="image" src={App.data_url + confirm_normal.item3.img}/>
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