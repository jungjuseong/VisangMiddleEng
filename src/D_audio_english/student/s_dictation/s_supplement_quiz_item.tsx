import * as React from 'react';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { Keyboard, state as keyBoardState } from '@common/component/Keyboard';
import { KTextArea } from '@common/component/KTextArea';

import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { App } from '../../../App';
import { IStateCtx, IActionsCtx } from '../s_store';

import { _getJSX, _getBlockJSX } from '../../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

export async function quizCapture(type:string) {
	const dialog = document.querySelectorAll(type)
	const url: any[] = [];
	for (let i = 0; i < dialog.length; i++) {
		url.push(await domtoimage.toPng(dialog[i], {
			cacheBust: false,
			height: 800,
			style: {
				top: 0,
				left: 0
			}
		}));
	}
	return url;
}
class NItem extends React.Component<{idx: number, on: boolean, onClick: (idx: number) => void}> {
	private _click = () => {
		this.props.onClick(this.props.idx);
	}
	public render() {
		const {idx, on} = this.props;
		return <span className={on ? 'on' : ''} onClick={this._click}></span>;
	}
}

interface IQuizItemProps {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
	idx: number;
	choice: number;
	data: common.IDictation[];
	dictationProg: QPROG;
	onChoice: (idx: number, choice: number|string, subidx: number) => void;
}
@observer
class SSupplementQuizItem extends React.Component<IQuizItemProps> {	
	@observable private _tlen = 0;
	@observable private _curIdx = 0;
	@observable private _swiper: Swiper | null = null;
	@observable private _sended: boolean = false;
	@observable private _select_area: number = 0;

	private _tarea: Array<Array<KTextArea|null>> = [[null,null,null],[null,null,null],[null,null,null]];
	private _canvas?: HTMLCanvasElement;
	private _ctx?: CanvasRenderingContext2D;

	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _refArea: Array<Array<(el: KTextArea|null) => void>> = [];

	public constructor(props: IQuizItemProps) {
		super(props);
		this._jsx_sentence = _getJSX(props.data[0].directive.kor);
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng);

		keyBoardState.state = 'hide';
		props.data.map((dictation,idx) => {
			this._refArea[idx] = [];
			for(let i = 0; i < 4 ; i ++) {
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

	private _onPage = (idx: number) =>{
		App.pub_playBtnTab();
		if(this._swiper) this._swiper.slideTo(idx);
	}
	
	private _onDone = (text: string) => {
		if (!this.props.view) return;
		this._tlen = text.trim().length;
		keyBoardState.state = 'off';
	}

	private _refSwiper = (el: SwiperComponent) => {
		if (this._swiper || !el) return;

		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			this._curIdx = -1;
		});
		swiper.on('transitionEnd', () => {
			if (this.props.view) {
				this._curIdx = swiper.activeIndex;
			}
		});
		this._swiper = swiper;
	}

	private _selectArea = (index: number) => {if (index !== null) this._select_area = index;};
	
	public componentDidUpdate(prev: IQuizItemProps) {
		const wrap1 = document.querySelector('.s_dictation .dict_question .q-item:nth-child(1) .scroll');
        const wrap2 = document.querySelector('.s_dictation .dict_question .q-item:nth-child(2) .scroll');
        const wrap3 = document.querySelector('.s_dictation .dict_question .q-item:nth-child(3) .scroll');
		const { view,dictationProg } = this.props;
		if(view && !prev.view) {
			this._tlen = 0;
			keyBoardState.state = 'on';

			// if(this._tarea) this._tarea.
			if (this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
				console.log('swiper.update');
			}
		} else if(!view && prev.view) {
			this._tlen = 0;
		}
		if(dictationProg === QPROG.COMPLETE && prev.dictationProg < QPROG.COMPLETE) {
			if(this._swiper) {
				this._swiper.slideTo(0);
			}
		}
		if (this.props.dictationProg >= QPROG.SENDED && this.props.view) {
			this._sended = true;
			keyBoardState.state = 'hide';
		}
		if(keyBoardState.state === 'on'){
            wrap1?.scrollTo(0,200);
            wrap2?.scrollTo(0,200);
            wrap3?.scrollTo(0,200);
        }
	}

	public render() {
		const { view, data, dictationProg } = this.props;
		const keyon = keyBoardState.state === 'on' ? ' key-on' : '';
		const alphabet = ['a', 'b', 'c'];
		let corrects: Array<Array<'' | 'O' | 'X'>> = [['', '', ''], ['', '', ''], ['', '', '']];
		if (dictationProg === QPROG.COMPLETE) {
			data.map((quiz, idx) => {
				const answerlist = [quiz.sentence1.answer1, quiz.sentence2.answer1, quiz.sentence3.answer1];
				answerlist.map((answer, index) => {
					if (answer === this._tarea[idx][index]?.value) {
						corrects[idx][index] = 'O';
					} else {
						corrects[idx][index] = 'X';
					}
				});
			});
		}
		return (
			<>
				<div className={"s_dictation"} style={{ display: view ? '' : 'none' }}>
					<div className={"btn_page_box" + keyon}>
						{data.map((quiz, idx) => {
							return <NItem key={idx} on={idx === this._curIdx} idx={idx} onClick={this._onPage} />;
						})}
					</div>
					<div className="dict_question quiz_box">
						<SwiperComponent ref={this._refSwiper}>
							{data.map((quiz, idx) => {
								const sentences = [quiz.sentence1, quiz.sentence2, quiz.sentence3];
								return (
									<div key={idx} className={'q-item' + keyon}>
										<div className={"scroll" + keyon}>
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
										</div>
										<div className="s_typing" >
											{sentences.map((sentence, index) => {
												if (sentence.answer1 === '') return;
												return (
													<div className="area-bnd" key={index} onClick={() => { this._selectArea(index)}}>															
														<div className={"answer_box "+ corrects[idx][index]}>
															{sentence.answer1}
														</div>
														<div className={"OX_box " + corrects[idx][index]}></div>
														<span className={"index"}>{alphabet[index]}.</span>
														<KTextArea
															ref={this._refArea[idx][index]}
															view={view}
															on={view && this._curIdx === idx && this._select_area === index && !this._sended}
															autoResize={true}
															skipEnter={false}
															onChange={(text: string) => {this._onChange(text, index)}}
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

export default SSupplementQuizItem;