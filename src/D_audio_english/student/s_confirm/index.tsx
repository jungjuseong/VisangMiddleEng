import * as React from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { App } from '../../../App';
import * as felsocket from '../../../felsocket';
import { ToggleBtn } from '@common/component/button';
import * as kutil from '@common/util/kutil';

import { IStateCtx, IActionsCtx, QPROG, SPROG } from '../s_store';
import { IQuizReturn,IQuizStringReturn,IQuizReturnMsg,IQuizStringReturnMsg ,IQuizUrlReturnMsg} from '../../common';
import SendUINew from '../../../share/sendui_new';

import SBasicQuizItem, {quizCapture as basicQuizCapture} from './s_basic_quiz_item';
import SSupplementQuizItem, {quizCapture as supQuizCapture} from './s_supplement_quiz_item';
import SHardQuizItem from './s_hard_quiz_item';


const SwiperComponent = require('react-id-swiper').default;

interface INItem {
	idx: number;
	on: boolean;
	OX: ''|'O'|'X';
	onClick: (idx: number) => void;
}

/*  페이지 인디게이터 관련  */
class NItem extends React.Component<INItem> {
	private _click = () => {
		this.props.onClick(this.props.idx);
	}
	public render() {
		const { idx, on } = this.props;
		return <span className={this.props.OX + (on ? ' on' : '')} onClick={this._click}>{idx + 1}</span>;
	}
}

interface ISQuestionProps {
	view: boolean;
	questionView: boolean;
	scriptProg: SPROG[];
	qsMode: ''|'question'|'script';
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class SConfirm extends React.Component<ISQuestionProps> {
	@observable private captureView = false;
	@observable private _curIdx = 0;
	@observable private _curIdx_tgt = 0;
	@observable private _choices: IQuizReturn = {
		answer1: 0,
		answer2: 0,
		answer3: 0
	};
	@observable private _writings: IQuizStringReturn = {
		answer1: '',
		answer2: '',
		answer3: ''
	};
	@observable private _felView = false;

	private _style: React.CSSProperties = {};
	private _swiper: Swiper|null = null;

	constructor(props: ISQuestionProps) {
		super(props);
	}

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;

		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			this._curIdx = -1;
		});
		swiper.on('transitionEnd', () => {
			if(this.props.view) {
				this._curIdx = swiper.activeIndex;
				this._curIdx_tgt = this._curIdx;
			}
		});
		this._swiper = swiper;
	}

	private _onSend = async () => {
		const { state,actions } = this.props;
		if(state.confirmSupProg !== QPROG.ON && state.idx === 0) return;
		if(state.confirmBasicProg !== QPROG.ON && state.idx === 1) return;
		if(state.confirmHardProg !== QPROG.ON && state.idx === 2) return;
		App.pub_playToPad();
		let choices: IQuizReturn;
		let writings: IQuizStringReturn;
		choices = this._choices;
		writings = this._writings;
		// 초기화 함수 만들어서 할것
		this._writings = { answer1: '', answer2: '', answer3: ''};
		this._choices = { answer1: 0, answer2: 0, answer3: 0};

		if(state.idx === 0) {
			state.confirmSupProg = QPROG.COMPLETE;
			this.captureView = true
			const url = await supQuizCapture();
			state.confirmSupProg = QPROG.ON;
			this.captureView = false
			console.log('url',url)
			state.confirmSupProg = QPROG.SENDING;
			if(App.student) {
				const msg: IQuizUrlReturnMsg = {
					msgtype: 'confirm_return',
					idx: 0,
					id: App.student.id,
					returns: choices,
					imgUrl:url
				};
	
				felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
				await kutil.wait(600);
	
				if(state.confirmSupProg === QPROG.SENDING) {
					state.confirmSupProg = QPROG.SENDED;
	
					App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
					actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
				}
			}
		} else if(state.idx === 1) {
			state.confirmBasicProg = QPROG.COMPLETE;
			const url = await basicQuizCapture();
			state.confirmBasicProg = QPROG.ON;
			console.log('url',url)
			state.confirmBasicProg = QPROG.SENDING;
			if(App.student) {
				const msg: IQuizReturnMsg = {
					msgtype: 'confirm_return',
					idx: 1,
					id: App.student.id,
					returns: choices
				};
	
				felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
				await kutil.wait(600);
	
				if(state.confirmBasicProg === QPROG.SENDING) {
					state.confirmBasicProg = QPROG.SENDED;
	
					App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
					actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
				}
			}
		} else if(state.idx === 2) {
			state.confirmHardProg = QPROG.SENDING;
			if(App.student) {
				const msg: IQuizStringReturnMsg = {
					msgtype: 'confirm_return',
					idx: 2,
					id: App.student.id,
					returns: writings
				};
	
				felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
				await kutil.wait(600);
	
				if(state.confirmHardProg === QPROG.SENDING) {
					state.confirmHardProg = QPROG.SENDED;
	
					App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
					actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
				}
			}
		} 
		return;
	}

	private _onChoice = (idx: number, choice: number|string) => {
		const { state,actions } = this.props;
		if(state.confirmSupProg !== QPROG.ON && state.idx === 0) return;
		if(state.confirmBasicProg !== QPROG.ON && state.idx === 1) return;
		if(state.confirmHardProg !== QPROG.ON && state.idx === 2) return;

		App.pub_playBtnTab();
		if(state.idx === 0) {
			switch(idx) {
				case 0:
					this._choices.answer1 = choice as number;
					break;
				
				case 1:
					this._choices.answer2 = choice as number;
					break;
				
				case 2:
					this._choices.answer3 = choice as number;
					break;				
				default : return;
			}
		} else if(state.idx === 1) {
			switch(idx) {
				case 0 :
					this._choices.answer1 = choice as number;
					break;				
				case 1:
					this._choices.answer2 = choice as number;
					break;				
				case 2:
					this._choices.answer3 = choice as number;
					break;				
				default : return;
			}
		} else if(state.idx === 2) {
			switch(idx) {
				case 0 :
					this._writings.answer1 = choice as string;
					break;				
				case 1:
					this._writings.answer2 = choice as string;
					break;
				case 2:
					this._writings.answer3 = choice as string;
					break;				
				default : return;
			}
		}
		const any_answer_zero = (this._choices.answer1 === 0 || this._choices.answer2 === 0 || this._choices.answer3 === 0);
		const any_writing_empty = (this._writings.answer1 === '' || this._writings.answer2 === '' || this._writings.answer3 === '');
		if(any_answer_zero && any_writing_empty) {
			this._felView = false;
			console.log('choices' + this._choices.answer1 + this._choices.answer2 + this._choices.answer3);
			console.log('chocie false');
		} else {
			this._felView = true;
			console.log('chocie true');
		}
	}
	private _gotoScript = () => {
		const { state } = this.props;
		if(state.qsMode === 'script') return;

		App.pub_playBtnTab();
		state.qsMode = 'script';
	}

	private _setStyle(props: ISQuestionProps) {
		this._style.transition = (props.questionView && props.scriptProg.find(it=> it>SPROG.UNMOUNT) !=undefined) ? 'left 0.3s' : '';		
		this._style.left = (props.questionView && props.qsMode === 'question') ? '0px' : '1280px';
	}

	public componentWillMount() {
		this._setStyle(this.props);		
	}

	public componentWillReceiveProps(next: ISQuestionProps) {
		const { state,qsMode,scriptProg } = this.props;
		if(next.state.confirmSupProg !== state.confirmSupProg ||
			next.state.confirmBasicProg !== state.confirmBasicProg ||
			next.state.confirmHardProg !== state.confirmHardProg ||
			next.scriptProg !== scriptProg ||
			next.qsMode !== qsMode
		) this._setStyle(next);		
	}
	
	public componentDidUpdate(prev: ISQuestionProps) {
		const {state, view, qsMode} = this.props;
		if (view && !prev.view) {			
			this._curIdx = 0;
			this._curIdx_tgt = 0;
			this._felView = false;

			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
			}
			if((state.confirmSupProg < QPROG.COMPLETE && state.idx === 0) || 
				(state.confirmBasicProg < QPROG.COMPLETE && state.idx === 1) ||
				(state.confirmHardProg < QPROG.COMPLETE && state.idx === 2)) {
					this._choices.answer1 = 0;
					this._choices.answer2 = 0;
					this._choices.answer3 = 0;
			}
		} else if (!view && prev.view) {
			if((state.confirmSupProg < QPROG.COMPLETE && state.idx === 0) || 
			(state.confirmBasicProg < QPROG.COMPLETE && state.idx === 1) ||
			(state.confirmHardProg < QPROG.COMPLETE && state.idx === 2)) {
				this._choices.answer1 = 0;
				this._choices.answer2 = 0;
				this._choices.answer3 = 0;
			}
		}
		if(qsMode === 'script' && prev.qsMode === 'question') {
			if(this._swiper) {
				this._swiper.slideTo(0);
			}			
		}
	}

	public render() {
		const {view, state, actions} = this.props;
		const c_data = actions.getData();
		const confirm_nomals = c_data.confirm_nomal;
		
		return (
			<div className="s_question" style={{...this._style}}>
				<div className="question" >
					<div className={'capture'} style={{display : (this.captureView? '' : 'none')}}/>
					<div className={'q-item'}>
						<SSupplementQuizItem
							view={view && state.idx === 0} 
							idx={0}
							data={c_data.confirm_sup[0]}
							confirmProg={state.confirmSupProg}
							onChoice={this._onChoice}
						/>
						<SBasicQuizItem
							view={view && state.idx === 1} 
							idx={1}
							choice={0}
							data={confirm_nomals[0]}
							confirmProg={state.confirmBasicProg}
							onChoice={this._onChoice}
						/>
						<SHardQuizItem
							view={view && state.idx === 2}
							state={state}
							actions={actions}
							idx={2}
							choice={0}
							data={c_data.confirm_hard[0]}
							confirmProg={state.confirmHardProg}
							onChoice={this._onChoice}
						/>
					</div>
				</div>
				<SendUINew view={view && this._felView}	type={'pad'} sended={false}	originY={0}	onSend={this._onSend}/>
			</div>
		);
	}
}
export default SConfirm;