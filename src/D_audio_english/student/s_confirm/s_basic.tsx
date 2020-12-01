import * as React from 'react';
import Draggable from 'react-draggable';

import { observable } from 'mobx';
import { observer } from 'mobx-react';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { App } from '../../../App';
import { timeStamp } from 'console';

interface IQuizItem {
	view: boolean;
	idx: number;
	choice: number;
	confirm_normal: common.IConfirmNomal;
	confirmProg: QPROG;
	onChoice: (idx: number, choice: number) => void;
}
@observer
class QuizItem extends React.Component<IQuizItem> {
	@observable private choices: number = 0;
	@observable private clickedNumber: number = 0;

	public constructor(props: IQuizItem) {
		super(props);
		this.clickedNumber = 0;
	}

	private _onChoice = (choice: number) => {
		this.props.onChoice(this.props.idx, choice);
	}

	public componentDidUpdate(prev: IQuizItem) {
		const { view } = this.props;
		if (view && !prev.view) {
			this.clickedNumber = 0;
		} else if (!this.props.view && prev.view) {
			this.clickedNumber = 0;
			App.pub_stop();
		}
	}

	state = {
		activeDrags: 0,
		deltaPosition: {
			x: 600, y: 400
		},
		controlledPosition: {
			x: -400, y: 200
		}
	};

	onStart = () => {
		this.setState({ activeDrags: ++this.state.activeDrags });
	};
	onStop = () => {
		this.setState({ activeDrags: --this.state.activeDrags });
	};

	handleStop = () => {
		console.log(`x: ${this.state.deltaPosition.x.toFixed(0)} y: ${this.state.deltaPosition.y.toFixed(0)}`);

		let draggable = document.querySelector(".draggable_place");
		if (draggable === null) return;


		let rect1 = draggable.getBoundingClientRect();
		const setOriginX = rect1['x'];
		const setOriginY = rect1['y'];

		// number
		let test = document.querySelector("#skiing");
		if (test === null) return;


		let rect = test.getBoundingClientRect();
		const x0 = rect['left'] - setOriginX;
		const x1 = rect['right'] - setOriginX;
		const y0 = rect['top'] - setOriginY;
		const y1 = rect['bottom'] - setOriginY;

		console.log(x0+"< x <"+ x1 + " " + y0 + "< y <"+ y1);
		if (this.state.deltaPosition.x >= x0 && this.state.deltaPosition.x <= x1){
			if (this.state.deltaPosition.y >= y0 && this.state.deltaPosition.y <= y1){
				this.choices = this.clickedNumber;
			}
		}
		this.state.deltaPosition.x = 600;
		this.state.deltaPosition.y = 400;
	}

	handleDrag = (e: any, ui: any) => {
		const { x, y } = this.state.deltaPosition;
		this.setState({
			deltaPosition: {
				x: x + ui.deltaX,
				y: y + ui.deltaY,
			}
		});
	};

	selectNumber = () => {
		console.log("select 1");
		this.clickedNumber = 1;

	}

	public render() {
		const { view, idx, choice, confirm_normal, confirmProg } = this.props;
		const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
		const { deltaPosition, controlledPosition } = this.state;

		console.log('랜더', this.choices)
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className="basic_place">
						<div className="quiz">
							<WrapTextNew view={view}>
								{confirm_normal.directive.kor}
							</WrapTextNew>
						</div>
						<div className="draggable_place">
							<div className="img_bundle">
								<img id="skiing" className="image" src={App.data_url + confirm_normal.item1.img} />
								<img className="image" src={App.data_url + confirm_normal.item2.img} />
								<img className="image" src={App.data_url + confirm_normal.item3.img} />
								<div className="number_box">{this.choices === 1 ? '1' : '0'}</div>
							</div>

							<Draggable
								bounds="parent" {...dragHandlers}
								// defaultPosition = {{x: 0, y: 25}}
								offsetParent={document.body} 
								positionOffset={{ x: 0, y: 0 }}
								position={{ x: 600, y: 400 }}
								onStop={this.handleStop}
								onDrag={this.handleDrag}
								onMouseDown={this.selectNumber}>
								<div className="box">1</div>
							</Draggable>
						</div>
					</div>
				</div>
			</>
		);
	}
}

export default QuizItem;