import * as React from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { App } from '../../../App';
import * as felsocket from '../../../felsocket';
import { ToggleBtn } from '@common/component/button';
import * as kutil from '@common/util/kutil';

import { IStateCtx, IActionsCtx, QPROG, SPROG } from '../s_store';
import { IQuizStringReturn,IAdditionalQuizReturnMsg } from '../../common';
import SendUINew from '../../../share/sendui_new';

import SSupplementQuizItem from './s_supplement_quiz_item';

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
class SDictation extends React.Component<ISQuestionProps> {
	@observable private _curIdx = 0;
	@observable private _curIdx_tgt = 0;
	@observable private _choices: IQuizStringReturn[] = [];
	@observable private _felView = false;

	private _style: React.CSSProperties = {};
	private _swiper: Swiper|null = null;

	constructor(props: ISQuestionProps) {
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
		const { state, actions } = this.props;
		if(state.dictationProg[state.idx] !== QPROG.ON && state.idx === 0) return;
		App.pub_playToPad();
		let choices: IQuizStringReturn[];
		choices = this._choices;
		// 초기화 함수 만들어서 할것
		const data = actions.getData();
		const data_array = [data.dictation_sup, data.dictation_basic, data.dictation_hard];
		state.dictationProg[state.idx] = QPROG.SENDING;
		if(App.student) {
			const msg: IAdditionalQuizReturnMsg = {
				msgtype: 'dictation_return',
				idx: state.idx,
				id: App.student.id,
				returns: choices
			};
			felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
			await kutil.wait(600);

			if(state.dictationProg[state.idx] === QPROG.SENDING) {
				state.dictationProg[state.idx] = QPROG.SENDED;
				App.pub_playGoodjob();	// 19-02-01 190108_검수사항 p.14 수정 
				actions.startGoodJob(); 	// 19-02-01 190108_검수사항 p.14 수정 
			}
		}
		for(let i = 0; i < data_array[state.idx].length; i++) {
			this._choices[i] = {
				answer1: '',
				answer2: '',
				answer3: ''
			};
		}
	}

	private _onChoice = (idx: number, choice: number|string, subidx: number) => {
		const { state,actions } = this.props;
		if(state.dictationProg[this.props.state.idx] !== QPROG.ON && state.idx === 0) return;
		App.pub_playBtnTab();
		switch(subidx) {
			case 0:
				this._choices[idx].answer1 = choice as string;
				break;			
			case 1:
				this._choices[idx].answer2 = choice as string;
				break;			
			case 2:
				this._choices[idx].answer3 = choice as string;
				break;			
			default : return;
		}
		const data = actions.getData();
		const data_array = [data.dictation_sup, data.dictation_basic, data.dictation_hard];
		let checkchoice = false;
		for(let i = 0 ; i < this._choices.length ; i++) {
			if((this._choices[i].answer1 === '' && data_array[state.idx][i].sentence1.answer1 !== '') || 
			(this._choices[i].answer2 === '' && data_array[state.idx][i].sentence2.answer1 !== '') || 
			(this._choices[i].answer3 === '' && data_array[state.idx][i].sentence3.answer1 !== '')) {
				checkchoice = true;
				break;
			}
		}		
		if(checkchoice) {
			this._felView = false;
			console.log('chocie false');
		} else {
			this._felView = true;
			console.log('chocie true');
		}		
	}

	private _gotoScript = () => {
		const {state} = this.props;
		if(state.qsMode === 'script') return;

		App.pub_playBtnTab();
		state.qsMode = 'script';
	}
	
	private _setStyle(props: ISQuestionProps) {
		const { questionView, scriptProg, qsMode } = props;
		this._style.transition = (questionView && scriptProg.find(it => it>SPROG.UNMOUNT) != undefined) ? 'left 0.3s' : '';
		this._style.left = (questionView && qsMode === 'question') ? '0px' : '1280px';
	}
	public componentWillMount() {
		this._setStyle(this.props);		
	}

	public componentWillReceiveProps(next: ISQuestionProps) {
		const { state, scriptProg, qsMode } = this.props;
		if(next.state.dictationProg[state.idx] !== state.dictationProg[state.idx] ||
			next.scriptProg !== scriptProg || next.qsMode !== qsMode
		) this._setStyle(next);		
	}
	
	public componentDidUpdate(prev: ISQuestionProps) {
		const { view, state, qsMode } = this.props;
		if (view && !prev.view) {			
			this._curIdx = 0;
			this._curIdx_tgt = 0;
			this._felView = false;

			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
			}
			if(state.dictationProg[state.idx] < QPROG.COMPLETE) {
					for(let i = 0; i < this._choices.length; i++) {
						this._choices[i].answer1 = '';
						this._choices[i].answer2 = '';
						this._choices[i].answer3 = '';
					}
			}
		} else if (!view && prev.view) {
			if(state.dictationProg[state.idx] < QPROG.COMPLETE ) {
				for(let i = 0; i < this._choices.length; i++) {
					this._choices[i].answer1 = '';
					this._choices[i].answer2 = '';
					this._choices[i].answer3 = '';
				}
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
		const data_array = [c_data.dictation_sup, c_data.dictation_basic, c_data.dictation_hard];
		const noSwiping = state.confirmSupProg === QPROG.ON;
		
		return (
			<div className="s_dictation" style={{...this._style}}>
				<div className="question">
					<div className={'q-item' + (noSwiping ? ' swiper-no-swiping' : '')}>
						{data_array.map((data,idx) =>
							<SSupplementQuizItem
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
						)}
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