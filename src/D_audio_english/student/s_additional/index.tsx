import * as React from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { App } from '../../../App';
import * as felsocket from '../../../felsocket';
import { ToggleBtn } from '@common/component/button';
import * as kutil from '@common/util/kutil';

import { IStateCtx, IActionsCtx, QPROG, SPROG } from '../s_store';
import * as common from '../../common';
import SendUINew from '../../../share/sendui_new';

import SBasic from './s_basic';
import SSup from './s_supplement';
import SHard from './s_hard';

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

interface ISQuestion {
	view: boolean;
	questionView: boolean;
	scriptProg: SPROG;
	qsMode: ''|'question'|'script';
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class SAdditional extends React.Component<ISQuestion> {
	@observable private _curIdx = 0;
	@observable private _curIdx_tgt = 0;
	@observable private _choices: common.IQuizStringReturn[] = [];
	@observable private _felView = false;

	private _style: React.CSSProperties = {};
	private _swiper: Swiper|null = null;

	constructor(props: ISQuestion) {
		super(props);
		const quizssup = props.actions.getData().additional_sup;
		for(let i = 0; i < quizssup.length; i++) {
			this._choices[i] = {
				answer1: '',
				answer2: '',
				answer3: ''
			};
		}
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
		if(this.props.state.additionalSupProg !== QPROG.ON && this.props.state.idx === 0) return;
		if(this.props.state.additionalBasicProg !== QPROG.ON && this.props.state.idx === 1) return;
		if(this.props.state.additionalHardProg !== QPROG.ON && this.props.state.idx === 2) return;
		App.pub_playToPad();
		let choices: common.IQuizStringReturn[];
		choices = this._choices;
		//초기화 함수 만들어서 할것
		const quizssup = this.props.actions.getData().additional_sup;
		if(this.props.state.idx === 0){
			this.props.state.additionalSupProg = QPROG.SENDING;
			if(App.student) {
				const msg: common.IAdditionalQuizReturnMsg = {
					msgtype: 'additional_return',
					idx: 0,
					id: App.student.id,
					returns: choices
				};
	
				felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
				await kutil.wait(600);
	
				if(this.props.state.additionalSupProg === QPROG.SENDING) {
					this.props.state.additionalSupProg = QPROG.SENDED;
	
					App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
					this.props.actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
				}
			}
		}else if(this.props.state.idx === 1){
			this.props.state.additionalBasicProg = QPROG.SENDING;
			if(App.student) {
				const msg: common.IAdditionalQuizReturnMsg = {
					msgtype: 'additional_return',
					idx:1,
					id: App.student.id,
					returns: choices
				};
	
				felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
				await kutil.wait(600);
	
				if(this.props.state.additionalBasicProg === QPROG.SENDING) {
					this.props.state.additionalBasicProg = QPROG.SENDED;
	
					App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
					this.props.actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
				}
			}
		}else if(this.props.state.idx === 2){
			this.props.state.additionalHardProg = QPROG.SENDING;
			if(App.student) {
				const msg: common.IAdditionalQuizReturnMsg = {
					msgtype: 'additional_return',
					idx:2,
					id: App.student.id,
					returns: choices
				};
	
				felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
				await kutil.wait(600);
	
				if(this.props.state.additionalHardProg === QPROG.SENDING) {
					this.props.state.additionalHardProg = QPROG.SENDED;
	
					App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
					this.props.actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
				}
			}
		}else{
			return
		}
		for(let i = 0; i < quizssup.length; i++) {
			this._choices[i] = {
				answer1: '',
				answer2: '',
				answer3: ''
			};
		}
	}


	private _onChoice = (idx: number, choice: number|string, subidx: number) => {
		if(this.props.state.additionalSupProg !== QPROG.ON && this.props.state.idx === 0 ) return;
		if(this.props.state.additionalBasicProg !== QPROG.ON && this.props.state.idx === 1) return;
		if(this.props.state.additionalHardProg !== QPROG.ON && this.props.state.idx === 2) return;
		App.pub_playBtnTab();
		switch(subidx){
			case 0 :{
				this._choices[idx].answer1 = choice as string;
				break;
			}
			case 1 :{
				this._choices[idx].answer2 = choice as string;
				break;
			}
			case 2 :{
				this._choices[idx].answer3 = choice as string;
				break;
			}
			default : return;
		}
		const data = this.props.actions.getData()
		let checkchoice = false
		switch(this.props.state.idx){
			case 0 : {
				for(let i = 0 ; i < this._choices.length ; i++){
					if(this._choices[i].answer1 === '' || this._choices[i].answer2 ==='' || this._choices[i].answer3 === ''){
						checkchoice = true;
						break;
					}
				}
				break;
			}
			case 1 : {
				for(let i = 0 ; i < this._choices.length ; i++){
					if((this._choices[i].answer1 === '' && data.additional_basic[i].sentence_answer1 !='') || (this._choices[i].answer2 ==='' && data.additional_basic[i].sentence_answer2 !='') || (this._choices[i].answer3 === '' && data.additional_basic[i].sentence_answer3 !='')){
						checkchoice = true;
						break;
					}
				}
				break;
			}
			case 2 : {
				for(let i = 0 ; i < this._choices.length ; i++){
					if(this._choices[i].answer1 === '' || this._choices[i].answer2 ===''){
						checkchoice = true;
						break;
					}
				}
				break;
			}
			default : return;
		}
		
		if(checkchoice){
			this._felView = false;
		}else{
			this._felView = true;
			console.log('chocie true')
		}
		
	}
	private _gotoScript = () => {
		if(this.props.state.qsMode === 'script') return;

		App.pub_playBtnTab();
		this.props.state.qsMode = 'script';
	}
	private _setStyle(props: ISQuestion) {
		if(
			props.questionView &&
			props.scriptProg > SPROG.UNMOUNT
		) this._style.transition = 'left 0.3s';
		else this._style.transition = '';
		
		if(
			props.questionView && 
			props.qsMode === 'question'
		) this._style.left = '0px';
		else this._style.left = '1280px';
		// console.log(props, this._style);
	}
	public componentWillMount() {
		this._setStyle(this.props);		
	}

	public componentWillReceiveProps(next: ISQuestion) {
		if(
			next.state.confirmSupProg !== this.props.state.confirmSupProg ||
			next.state.confirmBasicProg !== this.props.state.confirmBasicProg ||
			next.state.confirmHardProg !== this.props.state.confirmHardProg ||
			next.scriptProg !== this.props.scriptProg ||
			next.qsMode !== this.props.qsMode
		) {
			this._setStyle(next);		
		}
	}
	
	public componentDidUpdate(prev: ISQuestion) {
		if (this.props.view && !prev.view) {			
			this._curIdx = 0;
			this._curIdx_tgt = 0;
			this._felView = false;

			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
			}
			if((this.props.state.confirmSupProg < QPROG.COMPLETE && this.props.state.idx === 0) || 
				(this.props.state.confirmBasicProg < QPROG.COMPLETE && this.props.state.idx === 1) ||
				(this.props.state.confirmHardProg < QPROG.COMPLETE && this.props.state.idx === 2)) {
					for(let i = 0; i < this._choices.length; i++) {
						this._choices[i].answer1 = '';
						this._choices[i].answer2 = '';
						this._choices[i].answer3 = '';
					}
			}
		} else if (!this.props.view && prev.view) {
			if((this.props.state.confirmSupProg < QPROG.COMPLETE && this.props.state.idx === 0) || 
			(this.props.state.confirmBasicProg < QPROG.COMPLETE && this.props.state.idx === 1) ||
			(this.props.state.confirmHardProg < QPROG.COMPLETE && this.props.state.idx === 2)) {
				for(let i = 0; i < this._choices.length; i++) {
					this._choices[i].answer1 = '';
					this._choices[i].answer2 = '';
					this._choices[i].answer3 = '';
				}
			}
		}

		if(this.props.qsMode === 'script' && prev.qsMode === 'question') {
			if(this._swiper) {
				this._swiper.slideTo(0);
			}			
		}
	}

	public render() {
		const {view, state, actions} = this.props;
		const c_data = actions.getData();
		const confirm_nomals = c_data.confirm_nomal;
		const noSwiping = state.confirmSupProg === QPROG.ON;
		
		return (
			<div className="s_additional" style={{...this._style}}>
				<ToggleBtn className="btn_SCRIPT" onClick={this._gotoScript} view={state.scriptProg > SPROG.UNMOUNT}/>
				<div className="question">
					<div className={'q-item' + (noSwiping ? ' swiper-no-swiping' : '')}>
						<SSup
							view={view && state.idx === 0}
							state={state}
							actions={actions}
							idx={0}
							choice={0}
							data={c_data.additional_sup}
							prog={state.additionalSupProg}
							onChoice={this._onChoice}
						/>
						<SBasic	
							view={view && state.idx === 1}
							state={state}
							actions={actions}
							idx={1}
							choice={0}
							data={c_data.additional_basic}
							prog={state.additionalBasicProg}
							onChoice={this._onChoice}
						/>
						<SHard							
							view={view && state.idx === 2}
							state={state}
							actions={actions}
							idx={1}
							choice={0}
							data={c_data.additional_hard}
							prog={state.additionalHardProg}
							onChoice={this._onChoice}
						/>
					</div>
				</div>
				<SendUINew
					view={view && this._felView}
					type={'pad'}
					sended={false}
					originY={0}
					onSend={this._onSend}
				/>
			</div>
		);
	}
}
export default SAdditional;