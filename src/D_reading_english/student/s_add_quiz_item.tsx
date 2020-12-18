import * as React from 'react';
import Draggable from 'react-draggable';

import { SENDPROG } from './s_store';
import { IAdditionalQuiz, } from '../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { IStateCtx, IActionsCtx, QnaProg } from './s_store';
import { _getJSX } from '../../get_jsx';

import SendUI from '../../share/sendui_new';

interface IQuizItemProps {
	view: boolean;
	data: IAdditionalQuiz[];
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class SAddQuizItem extends React.Component<IQuizItemProps> {
	@observable private _toggle: number[] = [];

	@observable private _felView = false;

	private _disable_toggle: boolean;
	private	_answer_dic: {};
	private _jsx_sentence: JSX.Element;


	quizCapture!: HTMLElement;
	private _refQuiz = (el: HTMLElement | null) => {
	  if (this.quizCapture || !el) return;
	  this.quizCapture = el;
	};
  

	public constructor(props: IQuizItemProps) {
		super(props);
		this._jsx_sentence = _getJSX(props.data[0].directive_kor); // 문제
		this._answer_dic = {1: true, 2: false};
		this._disable_toggle = false;
		for(let i = 0 ; i < props.data.length ; i++){
			this._toggle.push(0)
		}
	}

	private _onSend = async () => {
		const { state,actions } = this.props;
		state.addquizProg = SENDPROG.SENDED
		// App.pub_playToPad();
		// // 초기화 함수 만들어서 할것
		// this._writings = { answer1: '', answer2: '', answer3: ''};
		// this._choices = { answer1: 0, answer2: 0, answer3: 0};

		// if(state.idx === 0) {
		// 	const url = await supQuizCapture();
		// 	console.log('url',url)

		// 	state.confirmSupProg = QPROG.SENDING;
		// 	if(App.student) {
		// 		const msg: IQuizReturnMsg = {
		// 			msgtype: 'confirm_return',
		// 			idx: 0,
		// 			id: App.student.id,
		// 			returns: choices,
		// 			imgUrl:url
		// 		};
	
		// 		felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
		// 		await kutil.wait(600);
	
		// 		if(state.confirmSupProg === QPROG.SENDING) {
		// 			state.confirmSupProg = QPROG.SENDED;
	
		// 			App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
		// 			actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
		// 		}
		// 	}
		// } else if(state.idx === 1) {
		// 	const url = await basicQuizCapture();
		// 	console.log('url',url)

		// 	state.confirmBasicProg = QPROG.SENDING;
		// 	if(App.student) {
		// 		const msg: IQuizReturnMsg = {
		// 			msgtype: 'confirm_return',
		// 			idx: 1,
		// 			id: App.student.id,
		// 			returns: choices,
		// 			imgUrl:url
		// 		};
	
		// 		felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
		// 		await kutil.wait(600);
	
		// 		if(state.confirmBasicProg === QPROG.SENDING) {
		// 			state.confirmBasicProg = QPROG.SENDED;
	
		// 			App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
		// 			actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
		// 		}
		// 	}
		// } else if(state.idx === 2) {
		// 	const url = await hardQuizCapture('.s_question .question .q-item .hard_question .q-item');
		// 	console.log('url',url)
		// 	state.confirmHardProg = QPROG.SENDING;
		// 	if(App.student) {
		// 		const msg: IQuizStringReturnMsg = {
		// 			msgtype: 'confirm_return',
		// 			idx: 2,
		// 			id: App.student.id,
		// 			returns: writings,
		// 			imgUrl:url
		// 		};
	
		// 		felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
		// 		await kutil.wait(600);
	
		// 		if(state.confirmHardProg === QPROG.SENDING) {
		// 			state.confirmHardProg = QPROG.SENDED;
	
		// 			App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
		// 			actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
		// 		}
		// 	}
		// } 
		return;
	}

	private _onClickTrue = (param:number) => {
		if (this._disable_toggle) return;
		this._toggle[param] = 1;
		let tembool = true
		for(let i = 0 ; i < this._toggle.length ; i++){
			if(this._toggle[i] === 0){
				tembool = false	
			}
		}
		this._felView = tembool
	}

	private _onClickFalse = (param: number) => {
		if (this._disable_toggle) return;
		this._toggle[param] = 2;
		let tembool = true
		for(let i = 0 ; i < this._toggle.length ; i++){
			if(this._toggle[i] === 0){
				tembool = false	
			}
		}
		this._felView = tembool
	}
	
	private _getToggleState = (num: number, ORX: ''|'O'|'X') => {
		if(this.props.state.addquizProg === SENDPROG.COMPLETE) {
			if(this.props.data[num].answer === 1) {
				if(ORX === 'O') return 'on_true_t';
				else if(ORX === 'X') return 'on_false_f';						
				return 'on_true_t';
				
			} else {
				if(ORX === 'O') return 'on_false_t';
				else if(ORX === 'X') return 'on_true_f';						
				return 'on_false_t';						
			}	
		}
		if(this._toggle[num] === 0) return '';
		return (this._toggle[num] === 1) ? 'on_true' : 'on_false';
	}
	
	public state = {
		activeDrags: 0,
		deltaPosition: {
			x: 0, 
			y: 0
		},
		controlledPosition: {
			x: -400, 
			y: 200
		}
	};
	
	private onStart = () => {
		this.setState({activeDrags: ++this.state.activeDrags});
	}
	
	private onStop = () => {
		this.setState({activeDrags: --this.state.activeDrags});
	}

	public componentDidUpdate() {
		if(this.props.state.addquizProg === SENDPROG.SENDED) {
			this._disable_toggle = true;
		} 
	}

	public render() {
		const {view, state, data} = this.props;
		const dragHandlers = {onStart: this.onStart, onStop: this.onStop};
		let OXs: Array<''|'O'|'X'> = [];
		for(let i = 0 ; i < data.length ; i++){
			OXs.push('')
		}
		if(state.addquizProg === SENDPROG.COMPLETE) {
			console.log('complete');
			OXs.map((OX,idx) => {
				if(data[idx].answer === this._toggle[idx]) {
					OXs[idx] = 'O';
				} else {
					OXs[idx] = 'X';
				}
			});
			this._disable_toggle = true;
		}

		return (
			<>
				<div className="quiz_box" style={{display : view ? '' : 'none' }}>
					<div className="sup_question">
						<div className="quiz">
							<WrapTextNew view={view}>
								{this._jsx_sentence}
							</WrapTextNew>
						</div>
						<div>
						<div className="white_box">
							{data.map((quiz,idx)=>{
								return(
									<div>
										<p>{idx + 1}. {quiz.question}</p>
										<span className={OXs[idx]}/>
										<div className={'toggle_bundle ' + this._getToggleState(idx,OXs[idx])}>
											<div className="true" onClick={() => this._onClickTrue(idx)}/>
											<div className="false" onClick={() => this._onClickFalse(idx)}/>
										</div>
									</div>
								)
							})}
							</div>
						</div>
					</div>
				</div>
				<SendUI view={view && this._felView} type={'pad'} sended={false}	originY={0}	onSend={this._onSend}/>
			</>		
		);
	}
}

export default SAddQuizItem;