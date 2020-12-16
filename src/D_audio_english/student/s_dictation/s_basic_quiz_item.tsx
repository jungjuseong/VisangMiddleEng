import * as React from 'react';

import { QPROG } from '../s_store';
import { IDictation } from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { Keyboard, state as keyBoardState } from '@common/component/Keyboard';
import { KTextArea } from '@common/component/KTextArea';

import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { IStateCtx, IActionsCtx } from '../s_store';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizItemProps {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
	idx: number;
	choice: number;
	data: IDictation[];
	confirmProg: QPROG;
	onChoice: (idx: number, choice: number|string) => void;
}
@observer
class SBasicQuizItem extends React.Component<IQuizItemProps> {	
	@observable private _tlen = 0;
	@observable private _curIdx = 0;
	@observable private _swiper: Swiper|null = null;
	@observable private _sended: boolean = false;
	@observable private _select_area: number = 0;

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
		this._jsx_sentence = _getJSX(props.data[0].directive.kor);
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng);

		keyBoardState.state = 'hide';
	}

	private _onChoice = (choice: number) => {
		this.props.onChoice(this.props.idx, choice);
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
	private _refCanvas = (el: HTMLCanvasElement|null) => {
		if(this._canvas || !el) return;
		this._canvas = el;
		this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
	}

	private _refArea = [
		(el: KTextArea|null) => {
			if(this._tarea[0] || !el) return;
			this._tarea[0] = el;
		}
		,(el: KTextArea|null) => {
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
		if(this._swiper || !el) return;

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

	private _selectArea = (index: number) => {
		if (index !== null)	this._select_area = index;
	}

	public componentDidUpdate(prev: IQuizItemProps) {
		const {view, confirmProg} = this.props;
		if(view && !prev.view) {
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
		} else if(!view && prev.view) {
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
		const { view, data } = this.props;
		const keyon = keyBoardState.state === 'on' ? ' key-on' : '';
		const alphabet = ['a','b','c'];
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className="basic_question">
						<SwiperComponent ref={this._refSwiper}>
							{data.map((quiz, idx) => {	
								const sentences = [quiz.sentence1, quiz.sentence2, quiz.sentence3, quiz.sentence4];
								return (
									<div key={idx} className={'q-item' + keyon}>
										<div className="quiz">
											<WrapTextNew view={view}>
												{this._jsx_sentence}
											</WrapTextNew>
										</div>
										<div className="sentence_box">
											<canvas/>
											<div className="question_box">
												<p>{_getJSX(quiz.sentence)}</p>
											</div>
										</div>
										<div className="s_typing" >
											{sentences.map((sentence, index) => {
												if (sentence.answer1 === '') return;
												return (														
													<div className="area-bnd" key={index} onClick={() => this._selectArea(index)}>											
														<span className="index">{alphabet[index]}.</span>
														<KTextArea 
															ref={this._refArea[idx]} 
															view={view} 
															on={view && this._curIdx === idx && this._select_area === index && !this._sended}
															autoResize={true}
															skipEnter={false}
															onChange={this._onChange}
															onDone={this._onDone}
															maxLength={60}
															maxLineNum={3}
															rows={1}
														/>
													</div>
												);
											})}
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

export default SBasicQuizItem;