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
	data: common.IAdditionalBasic[];
	prog: QPROG;
	onChoice: (idx: number, choice: number|string, subidx:number) => void;
}
@observer
class SBasic extends React.Component<IQuizItem> {	
	@observable private _tlen = 0;
	@observable private _curIdx = 0;
	@observable private _swiper: Swiper|null = null;
	@observable private _sended: boolean = false;
	@observable private _select_area: number = 0;

	private _tarea: (KTextArea|null)[][] = [[null,null,null],[null,null,null],[null,null,null]];
	private _canvas?: HTMLCanvasElement;
	private _ctx?: CanvasRenderingContext2D;
 
	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _refArea:((el: KTextArea|null) =>void)[][] = [];

	public constructor(props: IQuizItem) {
		super(props);
		this._jsx_sentence = _getJSX(props.data[0].directive.kor);
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng);
		keyBoardState.state = 'hide';
		props.data.map((additional,idx)=>{
			this._refArea[idx] = []
			for(let i = 0; i < 4 ; i ++){
				this._refArea[idx][i] = ((el: KTextArea|null) => {
					if(this._tarea[idx][i] || !el) return;
					this._tarea[idx][i] = el;
				})
			}
		})
	}
	private _onChange = (text: string , index:number) => {
		if(!this.props.view) return;
		this.props.onChoice(this._curIdx,text,index);
		this._tlen = text.trim().length;
	}
	private _onDone = (text: string) => {
		
		if(!this.props.view) return;
		this._tlen = text.trim().length;
		keyBoardState.state = 'on';
	}
	private _selectArea = (index : number) =>{
		if (index !== null)
			this._select_area = index
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
			this._tlen = 0;
			keyBoardState.state = 'on';
			
			// if(this._tarea) this._tarea.
			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				console.log('swiper.update')
				this._swiper.update();
			}
		} else if(!this.props.view && prev.view) {
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
		if(this.props.prog === QPROG.COMPLETE){
			this._checkAnswer();
		}
	}

	private _checkAnswer = ()=>{
		const {data} = this.props;
		let OXs: (''|'O'|'X')[][] = [['','',''],['','',''],['','','']];
		data.map((quiz,idx) =>{
			const answerlist = [quiz.sentence_answer1, quiz.sentence_answer2, quiz.sentence_answer3];
			answerlist.map((answer,index)=>{
				if(answer === this._tarea[idx][index]?.value){
					OXs[idx][index] = 'O';
				}else{
					OXs[idx][index] = 'X';
				}
			})
		})
	}

	public render() {
		const { view, data ,state, prog} = this.props;
		const keyon = keyBoardState.state === 'on' ? ' key-on' : '';
		const alphabet = ['a','b','c'];	
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className="basic_question">
						<SwiperComponent ref={this._refSwiper}>
							{data.map((quiz, idx) => {	
								const answerlist = [quiz.sentence_answer1,quiz.sentence_answer2,quiz.sentence_answer3];
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
												<p>{idx + 1}.</p>
												<p>{_getJSX(quiz.sentence)}</p>
											</div>
											<div>
												<div className="answer_box" style={{ borderBottom: quiz.sentence_answer1 != '' ? '' : 'none',  }}></div>
												<div className="answer_box" style={{ borderBottom: quiz.sentence_answer2 != '' ? '' : 'none',  }}></div>
												<div className="answer_box" style={{ borderBottom: quiz.sentence_answer3 != '' ? '' : 'none',  }}></div>
											</div>
										</div>
										<div className="s_typing" >
											{answerlist.map((answer, index)=>{
												if (answer ===""){
													return;
												}
												else
													return (
														<div className="area-bnd" key={index} onClick={()=>{this._selectArea(index)}}>
															<span className="index">{alphabet[index]}.</span>
															<KTextArea 
																ref={this._refArea[idx][index]} 
																view={view} 
																on={view && this._curIdx === idx && this._select_area === index && !this._sended}
																autoResize={true}
																skipEnter={false}
																onChange={(text:string)=>{
																	this._onChange(text,index)}}
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