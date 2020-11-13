import * as React from 'react';
import Draggable from 'react-draggable';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
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
	state = {
		activeDrags: 0,
		deltaPosition: {
		x: 0, y: 0
		},
		controlledPosition: {
		x: -400, y: 200
		}
	};
	
	onStart = () => {
		this.setState({activeDrags: ++this.state.activeDrags});
	};
	
	onStop = () => {
		this.setState({activeDrags: --this.state.activeDrags});
	};
	
	public render() {
		const {view, idx, choice, confirm_normal, questionProg} = this.props;
		const dragHandlers = {onStart: this.onStart, onStop: this.onStop};
		return (	
			<>
				<div className="quiz"><div>
					<WrapTextNew 
						view={view}
					>
						{confirm_normal.directive.kor}
					</WrapTextNew>
				</div></div>
				<div className="quiz_box">
					<div className="choice">
						<img className="image" src={App.data_url + confirm_normal.item1.img}/>
						<img className="image" src={App.data_url + confirm_normal.item2.img}/>
						<img className="image" src={App.data_url + confirm_normal.item3.img}/>
					</div>
					<div className="place">
						<Draggable bounds="parent" {...dragHandlers}>
							<div className="box">1</div>
						</Draggable>
					</div>
				</div>
			</>		
		);
	}
}

export default QuizItem;