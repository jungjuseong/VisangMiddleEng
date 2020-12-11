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
	scriptProg: SPROG;
	qsMode: ''|'question'|'script';
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class SDictation extends React.Component<ISQuestion> {
	@observable private _curIdx = 0;
	@observable private _curIdx_tgt = 0;
	@observable private _choices: common.IQuizStringReturn[] = [];
	@observable private _felView = false;

	private _style: React.CSSProperties = {};
	private _swiper: Swiper|null = null;

	constructor(props: ISQuestion) {
		super(props);
		for(let i = 0; i < 3; i++) {
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
		if(this.props.state.dictationProg[this.props.state.idx] !== QPROG.ON && this.props.state.idx === 0) return;
		App.pub_playToPad();
		let choices: common.IQuizStringReturn[];
		choices = this._choices;
		//초기화 함수 만들어서 할것
		const data = this.props.actions.getData();
		const data_array = [data.dictation_sup,data.dictation_basic,data.dictation_hard]
		this.props.state.dictationProg[this.props.state.idx] = QPROG.SENDING;
		if(App.student) {
			const msg: common.IAdditionalQuizReturnMsg = {
				msgtype: 'dictation_return',
				idx: this.props.state.idx,
				id: App.student.id,
				returns: choices
			};

			felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
			await kutil.wait(600);

			if(this.props.state.dictationProg[this.props.state.idx] === QPROG.SENDING) {
				this.props.state.dictationProg[this.props.state.idx] = QPROG.SENDED;

				App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
				this.props.actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
			}
		}
		for(let i = 0; i < data_array[this.props.state.idx].length; i++) {
			this._choices[i] = {
				answer1: '',
				answer2: '',
				answer3: ''
			};
		}
	}

	private _onChoice = (idx: number, choice: number|string, subidx: number) => {
		if(this.props.state.dictationProg[this.props.state.idx] !== QPROG.ON && this.props.state.idx === 0) return;
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
		const data_array = [data.dictation_sup,data.dictation_basic,data.dictation_hard]
		let checkchoice = false
		for(let i = 0 ; i < this._choices.length ; i++){
			if((this._choices[i].answer1 === '' && data_array[this.props.state.idx][i].sentence1.answer1 !='') || (this._choices[i].answer2 ==='' && data_array[this.props.state.idx][i].sentence2.answer1 !='') || (this._choices[i].answer3 === '' && data_array[this.props.state.idx][i].sentence3.answer1 !='')){
				checkchoice = true;
				break;
			}
		}
		
		if(checkchoice){
			this._felView = false;
			console.log('chocie false')
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
			next.state.dictationProg[this.props.state.idx] !== this.props.state.dictationProg[this.props.state.idx] ||
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
			if(this.props.state.dictationProg[this.props.state.idx] < QPROG.COMPLETE) {
					for(let i = 0; i < this._choices.length; i++) {
						this._choices[i].answer1 = '';
						this._choices[i].answer2 = '';
						this._choices[i].answer3 = '';
					}
			}
		} else if (!this.props.view && prev.view) {
			if(this.props.state.dictationProg[this.props.state.idx] < QPROG.COMPLETE ) {
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
		const data_array = [c_data.dictation_sup,c_data.dictation_basic,c_data.dictation_hard]
		const noSwiping = state.confirmSupProg === QPROG.ON;
		
		return (
			<div className="s_dictation" style={{...this._style}}>
				<ToggleBtn className="btn_SCRIPT" onClick={this._gotoScript} view={state.scriptProg > SPROG.UNMOUNT}/>
				<div className="question">
					<div className={'q-item' + (noSwiping ? ' swiper-no-swiping' : '')}>
						{data_array.map((data,idx) =>{
							return <SSup
									key={idx}						
									view={view && state.idx === idx}
									state={state}
									actions={actions}
									idx={idx}
									choice={0}
									data={data}
									dictationProg={state.dictationProg[idx]}
									onChoice={this._onChoice}
									/>
						})}
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
export default SDictation;