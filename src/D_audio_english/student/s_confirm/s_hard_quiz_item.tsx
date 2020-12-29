import * as React from 'react';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { Keyboard, state as keyBoardState } from '@common/component/Keyboard';
import { KTextArea } from '@common/component/KTextArea';
import ReactResizeDetector from 'react-resize-detector';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { App } from '../../../App';
import { NItem } from './index';

import { IStateCtx, IActionsCtx } from '../s_store';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

export async function quizCapture(type:string) {

	const dialog = document.querySelectorAll(type)
  
	const url: any[] = [];
	for (let i = 0; i < dialog.length; i++) {
		url.push(
			await domtoimage.toPng(dialog[i], {
				cacheBust: false,
				height: 800,
				style: {
					top: 0,
					left: 0
				}
			})
		);
	}

	return url;

}

interface IQuizItemProps {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
	idx: number;
	choice: number;
	data: common.IConfirmHard;
	confirmProg: QPROG;
	onChoice: (idx: number, choice: number|string) => void;
}

@observer
class SHardQuizItem extends React.Component<IQuizItemProps> {	
	@observable private _tlen = 0;
	@observable private _curIdx = 0;
	@observable private _swiper: Swiper|null = null;
	@observable private _sended: boolean = false;

	private _bndW = 0;
	private _bndH = 0;
	private _bndW_p = 0;
	private _bndH_p = 0;

	private _tarea: Array<KTextArea|null> = [null,null,null];
	private _canvas?: HTMLCanvasElement;
	private _ctx?: CanvasRenderingContext2D;
    private _stime = 0;
 
	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;

	public constructor(props: IQuizItemProps) {
		super(props);
		this._jsx_sentence = _getJSX(props.data.directive.kor);
		this._jsx_eng_sentence = _getJSX(props.data.directive.eng);

		keyBoardState.state = 'hide';
	}
	private _onChange = (text: string) => {
		if(this._stime === 0) this._stime = Date.now();
		
		if(!this.props.view) return;
		this.props.onChoice(this._curIdx,text);
		this._tlen = text.trim().length;
	}
	private _onDone = (text: string) => {
		if(this._stime === 0) this._stime = Date.now();
		
		if(!this.props.view) return;
		this._tlen = text.trim().length;
		keyBoardState.state = 'on';
	}
	private _onPage = (idx: number) =>{
		App.pub_playBtnTab();
		if(this._swiper) this._swiper.slideTo(idx);
	}
		
	private _refArea = [
		(el: KTextArea|null) => {
			if(this._tarea[0] || !el) return;
			this._tarea[0] = el;
		},
		(el: KTextArea|null) => {
			if(this._tarea[1] || !el) return;
			this._tarea[1] = el;
		},
		(el: KTextArea|null) => {
			if(this._tarea[2] || !el) return;
			this._tarea[2] = el;
		}
	];

	private _onResize = (w: number, h: number) => {
		this._bndW = w;
		this._bndH = h;
	}

	private _refSwiper = (el: SwiperComponent) => {
		if (this._swiper || !el) return;

		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			this._curIdx = -1;
		});
		swiper.on('transitionEnd', () => {
			if(this.props.view) {
				this._curIdx = swiper.activeIndex;
			}
		});
		this._swiper = swiper;
	}

	public componentDidUpdate(prev: IQuizItemProps) {
		const { view,confirmProg } = this.props;
		if (view && !prev.view) {
			this._bndH_p = 0;
			this._bndW_p = 0;
			this._tlen = 0;
			keyBoardState.state = 'on';
			
			// if(this._tarea) this._tarea.
			this._stime = 0;
			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
			}
		} else if (!view && prev.view) {
			this._bndH_p = 0;
			this._bndW_p = 0;
			this._tlen = 0;
		}
		if(confirmProg === QPROG.COMPLETE && prev.confirmProg < QPROG.COMPLETE) {
			if(this._swiper) {
				this._swiper.slideTo(0);
			}			
		}
		if(confirmProg >= QPROG.SENDED && this.props.view) {
			this._sended = true;
			keyBoardState.state = 'hide';
		}
	}

	public render() {
		const { view, data ,state} = this.props;
		const keyon = keyBoardState.state === 'on' ? ' key-on' : '';
		const quizs = [data.problem1, data.problem2, data.problem3];
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className={"btn_page_box" + keyon}>
						{quizs.map((quiz, idx) => {
							return <NItem key={idx} on={idx === this._curIdx} idx={idx} onClick={this._onPage} />;
						})}
					</div>
					<div className="hard_question">
						<SwiperComponent ref={this._refSwiper}>
							{quizs.map((quiz, idx) => {
								return (
									<div key={idx} className={'q-item' + keyon}>
										<div className="quiz">
											<WrapTextNew view={view}>
												{this._jsx_sentence}
											</WrapTextNew>
										</div>
										<div className={"scroll" + keyon}> 
											<div className="sentence_box">
												<canvas/>
												<div className="question_box">
													<p>{idx + 1}. {quizs[idx].question}</p>
													<p className={state.hint ? 'hint' : 'no_hint'}>{state.hint ? _getBlockJSX(quiz.hint) : ''}</p>
												</div>
											</div>
										</div>
										<div className="s_typing" >
											<div className="area-bnd">
												<KTextArea 
													ref={this._refArea[idx]} 
													view={view} 
													on={view && this._curIdx === idx && !this._sended}
													autoResize={true}
													skipEnter={false}
													onChange={this._onChange}
													onDone={this._onDone}
													maxLength={60}
													maxLineNum={3}
													rows={1}
												/>
												<ReactResizeDetector handleWidth={false} handleHeight={true} onResize={this._onResize}/>
											</div>
										</div>
									</div>
								);
							})}
						</SwiperComponent>
						<Keyboard />
					</div>
				</div>
			</>
		);
	}
}

export default SHardQuizItem;