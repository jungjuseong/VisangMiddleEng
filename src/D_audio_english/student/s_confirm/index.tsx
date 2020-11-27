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
	confirmProg: QPROG;
	scriptProg: SPROG;
	qsMode: ''|'question'|'script';
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class SQuestion extends React.Component<ISQuestion> {
	@observable private _curIdx = 0;
	@observable private _curIdx_tgt = 0;
	@observable private _choice: common.IQuizReturn = {
		answer: 0,
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
		if(this.props.confirmProg !== QPROG.ON) return;
		App.pub_playToPad();
		this.props.state.confirmProg = QPROG.SENDING;
		const choice: common.IQuizReturn = {
			answer:0 ,
			stime: 0,
			etime: 0,
		};
		if(App.student) {
			const msg: common.IQuizReturnMsg = {
				msgtype: 'confirm_return',
				id: App.student.id,
				return: choice
			};

			felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
			await kutil.wait(600);

			if(this.props.state.confirmProg === QPROG.SENDING) {
				this.props.state.confirmProg = QPROG.SENDED;

				App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
				this.props.actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
			}
		}
	}


	private _onChoice = (idx: number, choice: number) => {
		if(this.props.confirmProg !== QPROG.ON) return;
		else if(idx !== this._curIdx) return;

		App.pub_playBtnTab();
		if(this._choice) {
			this._choice.etime = Date.now();
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
			next.confirmProg !== this.props.confirmProg ||
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
			if(this.props.confirmProg < QPROG.COMPLETE) {
				this._choice.stime = Date.now();
				this._choice.etime = 0;
			}
		} else if (!this.props.view && prev.view) {
			if(this.props.confirmProg < QPROG.COMPLETE) {
				this._choice.stime = Date.now();
				this._choice.etime = 0;
			}
		}
		if(this.props.confirmProg === QPROG.COMPLETE && prev.confirmProg < QPROG.COMPLETE) {
			if(this._swiper) {
				this._swiper.slideTo(0);
				console.log('complete')
			}			
		} 

		if(this.props.qsMode === 'script' && prev.qsMode === 'question') {
			if(this._swiper) {
				this._swiper.slideTo(0);
			}			
		}
	}

	public render() {
		const {view, state, actions, confirmProg} = this.props;
		const c_data = actions.getData();
		const introductions = c_data.introduction;
		const confirm_nomals = c_data.confirm_nomal;
		const noSwiping = confirmProg === QPROG.ON;

		const curChoice = this._curIdx >= 0 ? this._choice : undefined;
		const curAnswer = curChoice ? curChoice.answer : 0;
		const canNext = curAnswer > 0 && confirmProg === QPROG.ON;
		const isLast = this._curIdx === introductions.length - 1;
		
		return (
			<div className="s_question" style={{...this._style}}>
				<ToggleBtn className="btn_SCRIPT" onClick={this._gotoScript} view={state.scriptProg > SPROG.UNMOUNT}/>
				<div className="question">
					<div className={'q-item' + (noSwiping ? ' swiper-no-swiping' : '')}>
						<SSup
							view={view} 
							idx={this._curIdx}
							choice={0}
							data={c_data.confirm_sup[0]}
							confirmProg={confirmProg}
							onChoice={this._onChoice}
						/>
						{/* <SBasic
							view={view} 
							idx={this._curIdx}
							choice={0}
							confirm_normal={confirm_nomals[0]}
							confirmProg={confirmProg}
							onChoice={this._onChoice}
						/> */}
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