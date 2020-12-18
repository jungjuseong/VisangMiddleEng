import * as React from 'react';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { Keyboard, state as keyBoardState } from '@common/component/Keyboard';
import { KTextArea } from '@common/component/KTextArea';

import { observer } from 'mobx-react';
import { observable } from 'mobx';

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
	data: common.IAdditionalBasic[];
	prog: QPROG;
	onChoice: (idx: number, choice: number|string, subidx: number) => void;
}
@observer
class SBasicQuizItem extends React.Component<IQuizItemProps> {	
	@observable private _tlen = 0;
	@observable private _curIdx = 0;
	@observable private _swiper: Swiper|null = null;
	@observable private _sended: boolean = false;
	@observable private _select_area: number = 0;

	private _tarea: Array<Array<KTextArea|null>> = [[null,null,null],[null,null,null],[null,null,null]];
	private _canvas?: HTMLCanvasElement;
	private _ctx?: CanvasRenderingContext2D;
 
	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _refArea: Array<Array<(el: KTextArea|null) => void>> = [[]];

	public constructor(props: IQuizItemProps) {
		super(props);
		this._jsx_sentence = _getJSX(props.data[0].directive.kor);
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng);
		keyBoardState.state = 'hide';
		props.data.map((additional,idx) => {
			this._refArea[idx] = [];
			for(let i = 0; i < 4 ; i++) {
				this._refArea[idx][i] = ((el: KTextArea|null) => {
					if(this._tarea[idx][i] || !el) return;
					this._tarea[idx][i] = el;
				});
			}
		});
	}
	private _onChange = (text: string , index: number) => {
		if(!this.props.view) return;
		this.props.onChoice(this._curIdx,text,index);
		this._tlen = text.trim().length;
	}
	
	private _onDone = (text: string) => {		
		if(!this.props.view) return;
		this._tlen = text.trim().length;
		keyBoardState.state = 'on';
	}

	private _selectArea = (index: number) => {
		if (index !== null)	this._select_area = index;
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

	public componentDidUpdate(prev: IQuizItemProps) {
		if(this.props.view && !prev.view) {
			this._tlen = 0;
			keyBoardState.state = 'on';
			
			// if(this._tarea) this._tarea.
			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				console.log('swiper.update');
				this._swiper.update();
			}
		} else if(!this.props.view && prev.view) {
			this._tlen = 0;
		}
		if(this.props.prog === QPROG.COMPLETE && prev.prog < QPROG.COMPLETE) {
			if(this._swiper) {
				this._swiper.slideTo(0);
			}
		}
		if(this.props.prog >= QPROG.SENDED && this.props.view) {
			this._sended = true;
			keyBoardState.state = 'hide';
		}
	}

	public render() {
		const { view, data ,state, prog} = this.props;
		const keyon = keyBoardState.state === 'on' ? ' key-on' : '';
		const alphabet = ['a','b','c'];
		let OXs: Array<''|'O'|'X'> = ['','',''];
		let corrects: Array<Array<(''|'O'|'X')>> = [['','',''],['','',''],['','','']];
		let correct_count = 0;
		if(this.props.prog === QPROG.COMPLETE) {
			this.props.data.map((quiz,idx) => {
				const answer_list = [quiz.sentence_answer1, quiz.sentence_answer2, quiz.sentence_answer3];
				correct_count = 0;
				answer_list.map((answer,index) => {
					if(answer === '') correct_count -= 1;
					if (answer === this._tarea[idx][index]?.value) {
						corrects[idx][index] = 'O';
						correct_count += 1;
					} else {
						corrects[idx][index] = 'X';
					}
					OXs[idx] = (correct_count === answer_list.length) ? 'O' : 'X';
				});
			});
		}
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className="basic_question">
						<SwiperComponent ref={this._refSwiper}>
							{data.map((quiz, idx) => {	
								const answerlist = [quiz.sentence_answer1,quiz.sentence_answer2,quiz.sentence_answer3];
								return (
									<div key={idx} className={'q-item' + keyon}>
										<div className="quiz">
											<WrapTextNew view={view}>
												{this._jsx_sentence}
											</WrapTextNew>
										</div>
										<div className="sentence_box">
											<div className={'OX_box ' + OXs[idx]}/>
											<canvas/>
											<div className="question_box">
												<p>{idx + 1}.</p>
												<p>{_getJSX(quiz.sentence)}</p>
												<div>
													<div className={"blank_box " + (quiz.sentence_answer1? '' : 'hide')} >a</div>
													<div className={"blank_box " + (quiz.sentence_answer2? '' : 'hide')} >b</div>
													<div className={"blank_box " + (quiz.sentence_answer3? '' : 'hide')} >c</div>
												</div>
											</div>
										</div>
										<div className="s_typing" >
											{answerlist.map((answer, index) => {
												if (answer === '') return;																			
												return (
													<div className="area-bnd" key={index} onClick={() => this._selectArea(index)}>
														<div className={'answer_box ' + corrects[idx][index]}>
															{answer}
														</div>
														<span className="index">{alphabet[index]}.</span>
														<KTextArea 
															ref={this._refArea[idx][index]} 
															view={view} 
															on={view && this._curIdx === idx && this._select_area === index && !this._sended}
															autoResize={true}
															skipEnter={false}
															onChange={(text: string) => this._onChange(text,index)}
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