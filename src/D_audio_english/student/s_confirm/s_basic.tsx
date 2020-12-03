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
	@observable private choices: Array<number> = [0,0,0];
	@observable private clickedNumber: number = 0;

	public constructor(props: IQuizItem) {
		super(props);
		this.clickedNumber = 0;
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
		firstPosition: {
			x: 500, y: 400
		},
		secondPosition: {
			x: 600, y: 400
		},
		thirdPosition: {
			x: 700, y: 400
		}
	};

	onStart = () => {
		this.setState({ activeDrags: ++this.state.activeDrags });
	};
	onStop = () => {
		this.setState({ activeDrags: --this.state.activeDrags });
	};

	private _ExclusiveGroup = (num : number) =>{
		for (let i = 0; i <this.choices.length; i ++)
			if(this.choices[i] === num)
				this.choices[i] = 0;
	}

	handleStop = () => {
		console.log(`x: ${this.state.firstPosition.x.toFixed(0)} y: ${this.state.firstPosition.y.toFixed(0)}`);
		console.log(`x: ${this.state.secondPosition.x.toFixed(0)} y: ${this.state.secondPosition.y.toFixed(0)}`);
		console.log(`x: ${this.state.thirdPosition.x.toFixed(0)} y: ${this.state.thirdPosition.y.toFixed(0)}`);

		const draggable = document.querySelector(".draggable_place");
		if (draggable === null) return;
		const drag_center = draggable.getBoundingClientRect();
		const setOriginX = drag_center['x'];
		const setOriginY = drag_center['y'];

		// image 1
		const image1 = document.querySelector("#skiing");
		if (image1 === null) return;
		const rect = image1.getBoundingClientRect();
		const x0 = rect['left'] - setOriginX;
		const x1 = rect['right'] - setOriginX;
		const y0 = rect['top'] - setOriginY;
		const y1 = rect['bottom'] - setOriginY;
		// image 2
		const image2 = document.querySelector("#riding");
		if (image2 === null) return;
		const rect2 = image2.getBoundingClientRect();
		const x2 = rect2['left'] - setOriginX;
		const x3 = rect2['right'] - setOriginX;
		const y2 = rect2['top'] - setOriginY;
		const y3 = rect2['bottom'] - setOriginY;
		// image 3
		const image3 = document.querySelector("#waterPark");
		if (image3 === null) return;
		const rect3 = image3.getBoundingClientRect();
		const x4 = rect3['left'] - setOriginX;
		const x5 = rect3['right'] - setOriginX;
		const y4 = rect3['top'] - setOriginY;
		const y5 = rect3['bottom'] - setOriginY;
		
		const position = [this.state.firstPosition, this.state.secondPosition, this.state.thirdPosition]
		console.log(x0+"< x <"+ x1 + " " + y0 + "< y <"+ y1);
		for (let i = 0; i < position.length; i++){
			if (position[i].x >= x0 && position[i].x <= x1){
				if (position[i].y >= y0 && position[i].y <= y1){
					this._ExclusiveGroup(this.clickedNumber);
					this.choices[0] = this.clickedNumber;
				}
			}
			if (position[i].x >= x2 && position[i].x <= x3){
				if (position[i].y >= y2 && position[i].y <= y3){
					this._ExclusiveGroup(this.clickedNumber);
					this.choices[1] = this.clickedNumber;
				}
			}
			if (position[i].x >= x4 && position[i].x <= x5){
				if (position[i].y >= y4 && position[i].y <= y5){
					this._ExclusiveGroup(this.clickedNumber);
					this.choices[2] = this.clickedNumber;
				}
			}
			position[i].y = 400;
		}
		this.state.firstPosition.x = 500;
		this.state.secondPosition.x = 600;
		this.state.thirdPosition.x = 700;
	}

	handleDrag = (e: any, ui: any) => {
		console.log(e);
		if(this.clickedNumber === 1){
			const { x, y } = this.state.firstPosition;
			this.setState({
				firstPosition: {
					x: x + ui.deltaX,
					y: y + ui.deltaY,
				}
			});
		}
		else if(this.clickedNumber === 2){
			const { x, y } = this.state.secondPosition;
			this.setState({
				secondPosition: {
					x: x + ui.deltaX,
					y: y + ui.deltaY,
				}
			});
		}
		else if(this.clickedNumber === 3){
			const { x, y } = this.state.thirdPosition;
			this.setState({
				thirdPosition: {
					x: x + ui.deltaX,
					y: y + ui.deltaY,
				}
			});
		}
		else return;
	};

	selectNumber = (num: number) => {
		console.log("select " + num);
		this.clickedNumber = num;
	}

	private _putNumber = (param: 0 | 1 | 2) => {
		console.log(this.choices[param]);
		if (this.choices[param] === 1){
			this.props.onChoice(param, 1);
			return '1';
		}	
		else if (this.choices[param] === 2){
			this.props.onChoice(param, 2);
			return '2';
		}
		else if (this.choices[param] === 3){
			this.props.onChoice(param, 3);
			return '3';
		}
		else
			return '';
	}

	public render() {
		const { view, idx, choice, confirm_normal, confirmProg } = this.props;
		const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
		
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
								<div>
									<img id="skiing" className="image" src={App.data_url + confirm_normal.item1.img} />
									<div className="number_box">{this._putNumber(0)}</div>
								</div>
								<div>
									<img id="riding" className="image" src={App.data_url + confirm_normal.item2.img} />
									<div className="number_box">{this._putNumber(1)}</div>
								</div>
								<div>
									<img id="waterPark" className="image" src={App.data_url + confirm_normal.item3.img} />
									<div className="number_box">{this._putNumber(2)}</div>
								</div>								
							</div>

							<Draggable
								bounds="parent" {...dragHandlers}
								positionOffset={{ x: 0, y: 0 }}
								position={{ x: 500, y: 400 }}
								onStop={this.handleStop}
								onDrag={this.handleDrag}
								onMouseDown={() => {this.selectNumber(1)}}>
								<div className="box">1</div>
							</Draggable>
							<Draggable
								bounds="parent" {...dragHandlers}
								positionOffset={{ x: 0, y: 0 }}
								position={{ x: 600, y: 400 }}
								onStop={this.handleStop}
								onDrag={this.handleDrag}
								onMouseDown={() => {this.selectNumber(2)}}>
								<div className="box">2</div>
							</Draggable>
							<Draggable
								bounds="parent" {...dragHandlers}
								positionOffset={{ x: 0, y: 0 }}
								position={{ x: 700, y: 400 }}
								onStop={this.handleStop}
								onDrag={this.handleDrag}
								onMouseDown={() => {this.selectNumber(3)}}>
								<div className="box">3</div>
							</Draggable>
						</div>
					</div>
				</div>
			</>
		);
	}
}

export default QuizItem;