import * as React from 'react';
import Draggable from 'react-draggable';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { state as keyBoardState } from '@common/component/Keyboard';
import { KTextArea } from '@common/component/KTextArea';
import TableItem from './table-item';

import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { IStateCtx, IActionsCtx } from '../s_store';

import { _getJSX, _getBlockJSX } from '../../../get_jsx';


const SwiperComponent = require('react-id-swiper').default;

interface IQuizItem {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
	idx: number;
	choice: number;
	data: common.IAdditionalSup[];
	prog: QPROG;
	onChoice: (idx: number, choice: number|string, subidx: number) => void;
}
@observer
class SHard extends React.Component<IQuizItem> {	
	@observable private _tlen = 0;
	@observable private _curIdx = 0;
	@observable private _renderCnt = 0;
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

	public constructor(props: IQuizItem) {
		super(props);
		this._jsx_sentence = _getJSX(props.data[0].directive.kor);
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng);

		keyBoardState.state = 'hide';
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

	// private _checkAnswer= () =>{
	// 	const { view, data ,state, prog, onChoice} = this.props;
	// 	{data.map((quiz, idx) => {
	// 		if(quiz.app_drops[idx].correct === "summer"){
	// 			console.log(quiz.app_drops[idx].correct);
	// 			console.log("correct");
	// 		}
	// 	})}
	// }

	public render() {
		const { view, data ,state, prog, onChoice} = this.props;
		let OXs: Array<''|'O'|'X'> = ['','',''];
		if(this.props.prog === QPROG.COMPLETE){
			{data.map((quiz, idx) => {
				let correct_num :number = 0;
				const answer_arr = [quiz.app_drops[0],quiz.app_drops[1],quiz.app_drops[2]]
				{answer_arr.map((answer, index)=>{
					if(answer.correct === answer.inputed){
						correct_num +=1;
					}
				})}
				if(correct_num === 3){
					OXs[idx] = 'O';
				}else{
					OXs[idx] = 'X';
				}
			})}
		}
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className="sup_question">
						<SwiperComponent ref={this._refSwiper}>
							{data.map((quiz, idx) => {
								return (
									<div key={idx} className="table_box">
										<div className="quiz">
											<WrapTextNew view={view}>
												{this._jsx_sentence}
											</WrapTextNew>
										</div>
										<div className={"OX_box " + OXs[idx]}></div>
										<TableItem
										viewCorrect={false}
										disableSelect={prog === QPROG.COMPLETE}
										viewResult = {prog === QPROG.COMPLETE}
										inview={view}
										graphic={quiz}
										className="type_3"
										maxWidth={1000}
										renderCnt={this._renderCnt}
										optionBoxPosition="bottom"
										viewBtn={false}
										idx={idx}
										onChoice = {onChoice}
										/>
									</div>
								);
							})}
						</SwiperComponent>
					</div>
				</div>
			</>
		);
	}
}

export default SHard;