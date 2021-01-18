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
	@observable private _hide_num_box: boolean[];
	@observable private _put_answer: boolean = false;

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
		this._hide_num_box = [false,false,false];
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
			x: 500, y: 430
		},
		secondPosition: {
			x: 600, y: 430
		},
		thirdPosition: {
			x: 700, y: 430
		}
	};

	private onStart = () => {
		this.setState({ activeDrags: ++this.state.activeDrags });
	}

	private onStop = () => {
		this.setState({ activeDrags: --this.state.activeDrags });
	}

	private _ExclusiveGroup = (num: number) => {
		if(this._choices[num] === 0){
			return
		}else{
			this._hide_num_box[this._choices[num] - 1] = false;
		}
	}

	private handleStop = () => {
		const draggable = document.querySelector('.draggable_place');
		if (draggable === null) return;
		const drag_center = draggable.getBoundingClientRect();
		const setOriginX = drag_center.x;
		const setOriginY = drag_center.y;

		const i_list = ['skiing','riding','waterPark'];
		let x : Array<number> = [];
		let y : Array<number> = [];
		i_list.map((img, idx)=>{
			let image = document.querySelector(`#${img}`)
			if (image === null) return;
			let rect = image.getBoundingClientRect();
			x.push(rect.left - setOriginX);
			x.push(rect.right - setOriginX);
			y.push(rect.top - setOriginY);
			y.push(rect.bottom - setOriginY);
		})
		
		const position = [this.state.firstPosition, this.state.secondPosition, this.state.thirdPosition];
		console.log(x[0] + '< x <' + x[1] + ' ' + y[0] + '< y <' + y[1]);
		for (let i = 0; i < position.length; i++) {
			for(let j = 0; j < i_list.length; j++){
				if (position[i].x >= x[j*2] && position[i].x <= x[j*2+1]) {
					if (position[i].y >= y[j*2] && position[i].y <= y[j*2+1]) {
						this._ExclusiveGroup(j);
						this._choices[j] = this._clicked_number;
						this.props.onChoice(j, this._clicked_number);
						this._put_answer = true;
					}
				}
			}
			position[i].y = 430;
		}
		if (this._put_answer === true)
			this._hide_num_box[this._clicked_number - 1] = true;
			this._put_answer= false;
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
	private _cancelNumbering = (idx : number)=>{
		if (this.props.confirmProg === QPROG.COMPLETE) return;
		this._hide_num_box[this._choices[idx] - 1] = false;
		this.props.onChoice(idx, 0);
		this._choices[idx] = 0;
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
			<div className="s_confirm" style={{ display: view ? '' : 'none' }} ref={this._refQuiz}>
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
									<div className={'number_box ' + OXs[0] } style={{left: "47px", top: "37px"}} onClick= {()=>{this._cancelNumbering(0)}}>{this._putNumber(0)}</div>
									<div className={'answer' + (this._view_answer ? '' : ' hide')}>{data.item1.answer}</div>
								</div>
								<div>
									<img id="riding" className="image" src={App.data_url + data.item2.img} />
									<div className={'number_box ' + OXs[1]} style={{left: "41px", top: "37px"}} onClick= {()=>{this._cancelNumbering(1)}}>{this._putNumber(1)}</div>
									<div className={'answer' + (this._view_answer ? '' : ' hide')}>{data.item2.answer}</div>
								</div>
								<div>
									<img id="waterPark" className="image" src={App.data_url + data.item3.img} />
									<div className={'number_box ' + OXs[2]} style={{left: "56px", top: "37px"}} onClick= {()=>{this._cancelNumbering(2)}}>{this._putNumber(2)}</div>
									<div className={'answer' + (this._view_answer ? '' : ' hide')}>{data.item3.answer}</div>
								</div>
							</div>
							{

							}
							<Draggable bounds="parent" {...dragHandlers} positionOffset={{ x: 0, y: 0 }} position={{ x: 500, y: 430 }} onStop={this.handleStop}	onDrag={this.handleDrag} onMouseDown={() => this.selectNumber(1)}>
								<div className={'box' + (this._sended || this._hide_num_box[0]? ' hide' : '')}>1</div>
							</Draggable>
							<Draggable bounds="parent" {...dragHandlers} positionOffset={{ x: 0, y: 0 }} position={{ x: 600, y: 430 }} onStop={this.handleStop} onDrag={this.handleDrag} onMouseDown={() => this.selectNumber(2)}>
								<div className={'box' + (this._sended || this._hide_num_box[1]? ' hide' : '')}>2</div>
							</Draggable>
							<Draggable bounds="parent" {...dragHandlers} positionOffset={{ x: 0, y: 0 }} position={{ x: 700, y: 430 }} onStop={this.handleStop} onDrag={this.handleDrag} onMouseDown={() => this.selectNumber(3)}>
								<div className={'box' + (this._sended || this._hide_num_box[2]? ' hide' : '')}>3</div>
							</Draggable>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default SBasicQuizItem;