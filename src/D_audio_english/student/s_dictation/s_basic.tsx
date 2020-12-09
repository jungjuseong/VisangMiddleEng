import * as React from 'react';
import Draggable from 'react-draggable';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { Keyboard, state as keyBoardState } from '@common/component/Keyboard';
import { KTextArea } from '@common/component/KTextArea';
import ReactResizeDetector from 'react-resize-detector';
import SendUI from '../../../share/sendui_new';
import { observer, PropTypes } from 'mobx-react';
import { observable } from 'mobx';

import { IStateCtx, IActionsCtx, SPROG } from '../s_store';

import { _getJSX, _getBlockJSX} from '../../../get_jsx';
import { App } from '../../../App';
import { NONE } from 'src/share/style';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizItem {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
	idx: number;
	choice: number;
	data: common.IDictation[];
	confirmProg: QPROG;
	onChoice: (idx: number, choice: number|string) => void;
}
@observer
class SBasic extends React.Component<IQuizItem> {	
	@observable private _tlen = 0;
	@observable private _curIdx = 0;
	@observable private _swiper: Swiper|null = null;
	@observable private _sended: boolean = false;
	@observable private _select_area: number = 0;

	private _bndW = 0;
	private _bndH = 0;
	private _bndW_p = 0;
	private _bndH_p = 0;

	private _tarea: (KTextArea|null)[] = [null,null,null];
	private _canvas?: HTMLCanvasElement;
	private _ctx?: CanvasRenderingContext2D;
    private _stime = 0;
 
	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;

	public constructor(props: IQuizItem) {
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
	private _refArea = [(el: KTextArea|null) => {
		if(this._tarea[0] || !el) return;
		this._tarea[0] = el;
	},(el: KTextArea|null) => {
		if(this._tarea[1] || !el) return;
		this._tarea[1] = el;
	},(el: KTextArea|null) => {
		if(this._tarea[2] || !el) return;
		this._tarea[2] = el;
	}]

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

	private _selectArea = (index : number) =>{
		if (index !== null)
			this._select_area = index
	}

	public componentDidUpdate(prev: IQuizItem) {
		if(this.props.view && !prev.view) {
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
		} else if(!this.props.view && prev.view) {
			this._bndH_p = 0;
			this._bndW_p = 0;
			this._tlen = 0;
			keyBoardState.state = 'hide';
		}
		if(this.props.confirmProg === QPROG.COMPLETE && prev.confirmProg < QPROG.COMPLETE) {
			if(this._swiper) {
				this._swiper.slideTo(0);
			}			
		}
		if(this.props.confirmProg >= QPROG.SENDED){
			this._sended = true
			keyBoardState.state = 'hide';
		}
	}

	public render() {
		const { view, data ,state} = this.props;
		const keyon = keyBoardState.state === 'on' ? ' key-on' : '';
		const alphabet = ['a','b','c'];
		const answer_arr = []
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className="basic_question">
						<SwiperComponent ref={this._refSwiper}>
							{data.map((quiz, idx) => {	
								const sentences = [quiz.sentence1, quiz.sentence2, quiz.sentence3, quiz.sentence4];
								return (
									<div key={idx} className= {"q-item" + keyon}>
										<div className="quiz">
											<WrapTextNew view={view}>
												{this._jsx_sentence}
											</WrapTextNew>
										</div>
										<div className="sentence_box">
											<canvas></canvas>
											<div className="question_box">
												<p>{_getJSX(quiz.sentence)}</p>
											</div>
										</div>
										<div className="s_typing" >
											{sentences.map((sentence, index)=>{
												if (sentence.answer1 ===""){
													return;
												}
												else
													return (														
														<div className="area-bnd" key={index} onClick={()=>{this._selectArea(index)}}>											
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

export default SBasic;