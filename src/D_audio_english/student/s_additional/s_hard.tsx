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
	data: common.IAdditionalHard[];
	prog: QPROG;
	onChoice: (idx: number, choice: number|string,subidx:number) => void;
}
@observer
class SHard extends React.Component<IQuizItem> {	
	@observable private _tlen = 0;
	@observable private _curIdx = 0;
	@observable private _swiper: Swiper|null = null;
	@observable private _sended: boolean = false;
	@observable private _select_area: number = 0;

	private _bndW = 0;
	private _bndH = 0;
	private _bndW_p = 0;
	private _bndH_p = 0;

	private _canvas?: HTMLCanvasElement;
	private _ctx?: CanvasRenderingContext2D;
    private _stime = 0;
 
	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _tarea: (KTextArea|null)[][] = [[null,null],[null,null],[null,null]];
	private _refArea:((el: KTextArea|null) =>void)[][] = [];

	public constructor(props: IQuizItem) {
		super(props);
		this._jsx_sentence = _getJSX(props.data[0].directive.kor);
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng);

		keyBoardState.state = 'hide';
		this._tarea.map((tarea,idx)=>{
			this._refArea[idx] = []
			for(let i = 0; i < 2 ; i ++){
				this._refArea[idx][i] = (el: KTextArea|null) => {
					if(tarea[i] || !el) return;
					tarea[i] = el;
				}
			}
		})
	}

	private _onChange = (text: string , index:number) => {
		if(!this.props.view) return;
		this.props.onChoice(this._curIdx,text,index);
		this._tlen = text.trim().length;
	}
	private _onDone = (text: string) => {
		if(this._stime === 0) this._stime = Date.now();
		
		if(!this.props.view) return;
		this._tlen = text.trim().length;
		keyBoardState.state = 'on';

	}
	private _selectArea = (index : number) =>{
		if (index !== null)
			this._select_area = index
	}
	private _refCanvas = (el: HTMLCanvasElement|null) => {
		if(this._canvas || !el) return;
		this._canvas = el;
		this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
	}

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
		if(this.props.prog === QPROG.COMPLETE && prev.prog < QPROG.COMPLETE) {
			if(this._swiper) {
				this._swiper.slideTo(0);
			}			
		}
		if(this.props.prog >= QPROG.SENDED){
			this._sended = true
			keyBoardState.state = 'hide';
		}
	}

	public render() {
		const { view, data ,state} = this.props;
		const keyon = keyBoardState.state === 'on' ? ' key-on' : '';
		const alphabet = ['a','b','c'];
		let correct_list: (''|'O'|'X')[] = ['','',''];
		let OXs: (''|'O'|'X')[][] = [['',''],['',''],['','']];
		if(this.props.prog === QPROG.COMPLETE){
			data.map((quiz,idx) =>{
				const answer_list = [quiz.sentence1.answer1, quiz.sentence1.answer2];
				if(answer_list[0] === this._tarea[idx][0]?.value){
					OXs[idx][0] = 'O';
				}
				else{
					OXs[idx][0] = 'X';
				}
				if(answer_list[1] === this._tarea[idx][1]?.value){
					OXs[idx][1] = 'O';
				}
				else{
					OXs[idx][1] = 'X';
				}
				if(OXs[idx][0] === 'O' && OXs[idx][1] === 'O'){
					correct_list[idx] = 'O';
				}else{
					correct_list[idx] = 'X';
				}
			})
		}
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className="hard_question">
						<SwiperComponent ref={this._refSwiper}>
							{data.map((quiz, idx) => {	
								return (
									<div key={idx} className= {"q-item" + keyon}>
										<div className="quiz">
											<WrapTextNew view={view}>
												{this._jsx_sentence}
											</WrapTextNew>
										</div>
										<div className="sentence_box">
											<div className={"OX_box " + correct_list[idx]}></div>
											<canvas></canvas>
											<div className="question_box">
												<p>{idx + 1}.</p>
												<p>{_getJSX(quiz.sentence)}</p>
											</div>
										</div>
										<div className="s_typing">
											<div className="area-bnd" onClick={()=>{this._selectArea(0)}}>
												<div className={"answer_box "+ OXs[idx][0]}>
													{quiz.sentence1.answer1}
												</div>
												<KTextArea 
													ref={this._refArea[idx][0]} 
													view={view} 
													on={view && this._curIdx === idx && this._select_area === 0 && !this._sended}
													autoResize={true}
													skipEnter={false}
													onChange={(text:string)=>{
														this._onChange(text,0)}}
													onDone={this._onDone}
													maxLength={60}
													maxLineNum={3}
													rows={1}
												/>
											</div>
											{' → '}
											<div className="area-bnd" onClick={()=>{this._selectArea(1)}}>
												<div className={"answer_box "+ OXs[idx][1]}>
													{quiz.sentence1.answer2}
												</div>
												<KTextArea 
													ref={this._refArea[idx][1]} 
													view={view} 
													on={view && this._curIdx === idx && this._select_area === 1 && !this._sended}
													autoResize={true}
													skipEnter={false}
													onChange={(text:string)=>{
														this._onChange(text,1)}}
													onDone={this._onDone}
													maxLength={60}
													maxLineNum={3}
													rows={1}
												/>
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

export default SHard;