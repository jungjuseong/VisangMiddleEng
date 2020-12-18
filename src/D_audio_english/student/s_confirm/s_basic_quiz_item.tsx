import * as React from 'react';
import Draggable from 'react-draggable';

import { observable } from 'mobx';
import { observer } from 'mobx-react';

import { QPROG } from '../s_store';
import { IConfirmNomal } from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { App } from '../../../App';

let _current: SBasicQuizItem | null = null;
export async function quizCapture() {
	if (!_current) return;

	const dialog = _current.quizCapture;
  
	let urli: any = '';
	urli = await domtoimage.toPng(dialog!, {
		cacheBust: false,
		height: 800,
		style: {
		// top: 0,
		// left: 0
		}
	});
	const url : any = []
	url.push(urli)
  
	return url;
}

interface IQuizItemProps {
	view: boolean;
	idx: number;
	choice: number;
	data: IConfirmNomal;
	confirmProg: QPROG;
	onChoice: (idx: number, choice: number) => void;
}

@observer
class SBasicQuizItem extends React.Component<IQuizItemProps> {
	@observable private _choices: number[] = [0,0,0];
	@observable private _clicked_number: number = 0;
	@observable private _sended: boolean;
	@observable private _view_answer: boolean;

	quizCapture!: HTMLElement;
	private _refQuiz = (el: HTMLElement | null) => {
	  if (this.quizCapture || !el) return;
	  this.quizCapture = el;
	};

	public constructor(props: IQuizItemProps) {
		super(props);
		this._clicked_number = 0;
		this._sended = false;
		this._view_answer = false;
	}

	public componentDidUpdate(prev: IQuizItemProps) {
		const { view,confirmProg } = this.props;
		if (view && !prev.view) {
			this._clicked_number = 0;
		} else if (!this.props.view && prev.view) {
			this._clicked_number = 0;
			App.pub_stop();
		}
		if (confirmProg === QPROG.SENDED) {
			this._sended = true;
		} else if (confirmProg === QPROG.COMPLETE) {
			this._sended = true;
			this._view_answer = true;
		}
	}

	public state = {
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

	private onStart = () => {
		this.setState({ activeDrags: ++this.state.activeDrags });
	}

	private onStop = () => {
		this.setState({ activeDrags: --this.state.activeDrags });
	}

	private _ExclusiveGroup = (num: number) => {
		for (let i = 0; i < this._choices.length; i ++) {
			if(this._choices[i] === num) {
				this._choices[i] = 0;
			}
		}
	}

	private handleStop = () => {
		// console.log(`x: ${this.state.firstPosition.x.toFixed(0)} y: ${this.state.firstPosition.y.toFixed(0)}`);
		// console.log(`x: ${this.state.secondPosition.x.toFixed(0)} y: ${this.state.secondPosition.y.toFixed(0)}`);
		// console.log(`x: ${this.state.thirdPosition.x.toFixed(0)} y: ${this.state.thirdPosition.y.toFixed(0)}`);

		const draggable = document.querySelector('.draggable_place');
		if (draggable === null) return;
		const drag_center = draggable.getBoundingClientRect();
		const setOriginX = drag_center.x;
		const setOriginY = drag_center.y;

		// image 1
		const image1 = document.querySelector('#skiing');
		if (image1 === null) return;
		const rect = image1.getBoundingClientRect();
		const x0 = rect.left - setOriginX;
		const x1 = rect.right - setOriginX;
		const y0 = rect.top - setOriginY;
		const y1 = rect.bottom - setOriginY;
		// image 2
		const image2 = document.querySelector('#riding');
		if (image2 === null) return;
		const rect2 = image2.getBoundingClientRect();
		const x2 = rect2.left - setOriginX;
		const x3 = rect2.right - setOriginX;
		const y2 = rect2.top - setOriginY;
		const y3 = rect2.bottom - setOriginY;
		// image 3
		const image3 = document.querySelector('#waterPark');
		if (image3 === null) return;
		const rect3 = image3.getBoundingClientRect();
		const x4 = rect3.left - setOriginX;
		const x5 = rect3.right - setOriginX;
		const y4 = rect3.top - setOriginY;
		const y5 = rect3.bottom - setOriginY;
		
		const position = [this.state.firstPosition, this.state.secondPosition, this.state.thirdPosition];
		console.log(x0 + '< x <' + x1 + ' ' + y0 + '< y <' + y1);
		for (let i = 0; i < position.length; i++) {
			if (position[i].x >= x0 && position[i].x <= x1) {
				if (position[i].y >= y0 && position[i].y <= y1) {
					this._ExclusiveGroup(this._clicked_number);
					this._choices[0] = this._clicked_number;
					this.props.onChoice(0, this._clicked_number);
				}
			}
			if (position[i].x >= x2 && position[i].x <= x3) {
				if (position[i].y >= y2 && position[i].y <= y3) {
					this._ExclusiveGroup(this._clicked_number);
					this._choices[1] = this._clicked_number;
					this.props.onChoice(1, this._clicked_number);
				}
			}
			if (position[i].x >= x4 && position[i].x <= x5) {
				if (position[i].y >= y4 && position[i].y <= y5) {
					this._ExclusiveGroup(this._clicked_number);
					this._choices[2] = this._clicked_number;
					this.props.onChoice(2, this._clicked_number);
				}
			}
			position[i].y = 400;
		}
		this.state.firstPosition.x = 500;
		this.state.secondPosition.x = 600;
		this.state.thirdPosition.x = 700;
	}

	private handleDrag = (e: any, ui: any) => {
		console.log(e);
		if (this._clicked_number === 1) {
			const { x, y } = this.state.firstPosition;
			this.setState({
				firstPosition: {
					x: x + ui.deltaX,
					y: y + ui.deltaY,
				}
			});
		} else if(this._clicked_number === 2) {
			const { x, y } = this.state.secondPosition;
			this.setState({
				secondPosition: {
					x: x + ui.deltaX,
					y: y + ui.deltaY,
				}
			});
		} else if(this._clicked_number === 3) {
			const { x, y } = this.state.thirdPosition;
			this.setState({
				thirdPosition: {
					x: x + ui.deltaX,
					y: y + ui.deltaY,
				}
			});
		}
		return;
	}

	private selectNumber = (num: number) => {
		console.log('select ' + num);
		this._clicked_number = num;
	}

	private _putNumber = (param: 0 | 1 | 2) => {
		console.log(this._choices[param]);
		if (this._choices[param] === 1) {
			return '1';
		} else if (this._choices[param] === 2) {
			return '2';
		} else if (this._choices[param] === 3) {
			return '3';
		} else {
			return '';
		}
	}

	public render() {
		_current = this;

		const { view, data, confirmProg } = this.props;
		const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
		let OXs: Array<''|'O'|'X'> = ['','',''];
		const answers = [data.item1.answer ,data.item2.answer,data.item3.answer];

		if(confirmProg === QPROG.COMPLETE) {
			OXs.map((OX, idx) => {
				if(answers[idx] === this._choices[idx]) {
					OXs[idx] = 'O';
				} else {
					OXs[idx] = 'X';
				}
			});
		}
		
		return (
			<div className="quiz_box" style={{ display: view ? '' : 'none' }} ref={this._refQuiz}>
				<div className="basic_question">
					<div className="basic_place">
						<div className="quiz">
							<WrapTextNew view={view}>
								{data.directive.kor}
							</WrapTextNew>
						</div>
						<div className="draggable_place">
							<div className="img_bundle">
								<div>
									<img id="skiing" className="image" src={App.data_url + data.item1.img} />
									<div className={'number_box ' + OXs[0]}>{this._putNumber(0)}</div>
									<div className={'answer' + (this._view_answer ? '' : ' hide')}>{data.item1.answer}</div>
								</div>
								<div>
									<img id="riding" className="image" src={App.data_url + data.item2.img} />
									<div className={'number_box ' + OXs[1]}>{this._putNumber(1)}</div>
									<div className={'answer' + (this._view_answer ? '' : ' hide')}>{data.item2.answer}</div>
								</div>
								<div>
									<img id="waterPark" className="image" src={App.data_url + data.item3.img} />
									<div className={'number_box ' + OXs[2]}>{this._putNumber(2)}</div>
									<div className={'answer' + (this._view_answer ? '' : ' hide')}>{data.item3.answer}</div>
								</div>
							</div>

							<Draggable bounds="parent" {...dragHandlers} positionOffset={{ x: 0, y: 0 }} position={{ x: 500, y: 400 }} onStop={this.handleStop}	onDrag={this.handleDrag} onMouseDown={() => this.selectNumber(1)}>
								<div className={'box' + (this._sended ? ' hide' : '')}>1</div>
							</Draggable>
							<Draggable bounds="parent" {...dragHandlers} positionOffset={{ x: 0, y: 0 }} position={{ x: 600, y: 400 }} onStop={this.handleStop} onDrag={this.handleDrag} onMouseDown={() => this.selectNumber(2)}>
								<div className={'box' + (this._sended ? ' hide' : '')}>2</div>
							</Draggable>
							<Draggable bounds="parent" {...dragHandlers} positionOffset={{ x: 0, y: 0 }} position={{ x: 700, y: 400 }} onStop={this.handleStop} onDrag={this.handleDrag} onMouseDown={() => this.selectNumber(3)}>
								<div className={'box' + (this._sended ? ' hide' : '')}>3</div>
							</Draggable>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default SBasicQuizItem;