import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

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
class SQuestion extends React.Component<ISQuestion> {
	@observable private _curIdx = 0;
	@observable private _curIdx_tgt = 0;
	@observable private _choices: common.IQuizReturn = {
		answer1: 0,
		answer2: 0,
		answer3: 0,
		stime: 0,
		etime: 0,
	};

	private _style: React.CSSProperties = {};
	private _swiper: Swiper|null = null;

	constructor(props: ISQuestion) {
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
		if(this.props.state.confirmSupProg !== QPROG.ON && this.props.state.idx === 0) return;
		if(this.props.state.confirmBasicProg !== QPROG.ON && this.props.state.idx === 1) return;
		if(this.props.state.confirmHardProg !== QPROG.ON && this.props.state.idx === 2) return;
		App.pub_playToPad();
		let choices: common.IQuizReturn;
		choices = this._choices;
		this._choices = {
			answer1: 0,
			answer2: 0,
			answer3: 0,
			stime: 0,
			etime: 0,
		}
		if(this.props.state.idx === 0){
			this.props.state.confirmSupProg = QPROG.SENDING;
			if(App.student) {
				const msg: common.IQuizReturnMsg = {
					msgtype: 'confirm_return',
					idx: 0,
					id: App.student.id,
					returns: choices
				};
	
				felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
				await kutil.wait(600);
	
				if(this.props.state.confirmSupProg === QPROG.SENDING) {
					this.props.state.confirmSupProg = QPROG.SENDED;
	
					App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
					this.props.actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
				}
			}
		}else if(this.props.state.idx === 1){
			this.props.state.confirmBasicProg = QPROG.SENDING;
			if(App.student) {
				const msg: common.IQuizReturnMsg = {
					msgtype: 'confirm_return',
					idx:1,
					id: App.student.id,
					returns: choices
				};
	
				felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
				await kutil.wait(600);
	
				if(this.props.state.confirmBasicProg === QPROG.SENDING) {
					this.props.state.confirmBasicProg = QPROG.SENDED;
	
					App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
					this.props.actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
				}
			}
		}else if(this.props.state.idx === 2){
			this.props.state.confirmHardProg = QPROG.SENDING;
			if(App.student) {
				const msg: common.IQuizReturnMsg = {
					msgtype: 'confirm_return',
					idx:2,
					id: App.student.id,
					returns: choices
				};
	
				felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
				await kutil.wait(600);
	
				if(this.props.state.confirmHardProg === QPROG.SENDING) {
					this.props.state.confirmHardProg = QPROG.SENDED;
	
					App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
					this.props.actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
				}
			}
		}else{
			return
		}
	}


	private _onChoice = (idx: number, choice: number) => {
		if(this.props.state.confirmSupProg !== QPROG.ON && this.props.state.idx === 0) return;
		if(this.props.state.confirmBasicProg !== QPROG.ON && this.props.state.idx === 1) return;
		if(this.props.state.confirmHardProg !== QPROG.ON && this.props.state.idx === 2) return;

		App.pub_playBtnTab();
		if(this.props.state.idx === 0){
			switch(idx){
				case 0 :{
					this._choices.answer1 = choice;
					this._choices.etime = Date.now();
					break;
				}
				case 1 :{
					this._choices.answer2 = choice;
					this._choices.etime = Date.now();
					break;
				}
				case 2 :{
					this._choices.answer3 = choice;
					this._choices.etime = Date.now();
					break;
				}
				default : return;
			}
		}else if(this.props.state.idx === 1){
			switch(idx){
				case 0 :{
					this._choices.answer1 = choice;
					this._choices.etime = Date.now();
					break;
				}
				case 1 :{
					this._choices.answer2 = choice;
					this._choices.etime = Date.now();
					break;
				}
				case 2 :{
					this._choices.answer3 = choice;
					this._choices.etime = Date.now();
					break;
				}
				default : return;
			}
		}else if(this.props.state.idx === 2){
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

			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
			}
			if((this.props.state.confirmSupProg < QPROG.COMPLETE && this.props.state.idx === 0) || 
				(this.props.state.confirmBasicProg < QPROG.COMPLETE && this.props.state.idx === 1) ||
				(this.props.state.confirmHardProg < QPROG.COMPLETE && this.props.state.idx === 2)) {
					this._choices.answer1 = 0;
					this._choices.answer2 = 0;
					this._choices.answer3 = 0;
					this._choices.stime = Date.now();
					this._choices.etime = 0;
			}
		} else if (!this.props.view && prev.view) {
			if((this.props.state.confirmSupProg < QPROG.COMPLETE && this.props.state.idx === 0) || 
			(this.props.state.confirmBasicProg < QPROG.COMPLETE && this.props.state.idx === 1) ||
			(this.props.state.confirmHardProg < QPROG.COMPLETE && this.props.state.idx === 2)) {
				this._choices.answer1 = 0;
				this._choices.answer2 = 0;
				this._choices.answer3 = 0;
				this._choices.stime = Date.now();
				this._choices.etime = 0;
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
			<div className="s_question" style={{...this._style}}>
				<ToggleBtn className="btn_SCRIPT" onClick={this._gotoScript} view={state.scriptProg > SPROG.UNMOUNT}/>
				<div className="question">
					<div className={'q-item' + (noSwiping ? ' swiper-no-swiping' : '')}>
						<SSup
							view={view && state.idx === 0} 
							idx={0}
							data={c_data.confirm_sup[0]}
							confirmProg={state.confirmSupProg}
							onChoice={this._onChoice}
						/>
						<SBasic
							view={view && state.idx === 1} 
							idx={1}
							choice={0}
							confirm_normal={confirm_nomals[0]}
							confirmProg={state.confirmBasicProg}
							onChoice={this._onChoice}
						/>
						<SHard
							view={view && state.idx === 2}
							idx={2}
							choice={0}
							data={c_data.confirm_hard[0]}
							confirmProg={state.confirmHardProg}
							onChoice={this._onChoice}
						/>
					</div>
				</div>
				<SendUINew
					view={true}
					type={'pad'}
					sended={false}
					originY={0}
					onSend={this._onSend}
				/>
			</div>
		);
	}
}
export default SQuestion;