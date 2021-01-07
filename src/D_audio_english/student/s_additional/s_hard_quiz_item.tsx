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
import { App } from '../../../App';

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
	data: common.IAdditionalHard[];
	prog: QPROG;
	onChoice: (idx: number, choice: number|string, subidx: number) => void;
}

@observer
class SHardQuizItem extends React.Component<IQuizItemProps> {	
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
	private _tarea: Array<Array<(KTextArea|null)>> = [[null,null],[null,null],[null,null]];
	private _refArea: Array<Array<((el: KTextArea|null) => void)>> = [];

	public constructor(props: IQuizItemProps) {
		super(props);
		this._jsx_sentence = _getJSX(props.data[0].directive.kor);
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng);

		keyBoardState.state = 'hide';
		this._tarea.map((tarea,idx) => {
			this._refArea[idx] = [];
			for(let i = 0; i < 2 ; i ++) {
				this._refArea[idx][i] = (el: KTextArea|null) => {
					if(tarea[i] || !el) return;
					tarea[i] = el;
				};
			}
		});
	}

	private _onChange = (text: string , index: number) => {
		if(!this.props.view) return;
		this.props.onChoice(this._curIdx,text,index);
		this._tlen = text.trim().length;
	}
	private _onDone = (text: string) => {
		if(this._stime === 0) this._stime = Date.now();
		
		if(!this.props.view) return;
		this._tlen = text.trim().length;
		keyBoardState.state = 'off';

	}
	private _selectArea = (index: number) => {
		if (index != null) this._select_area = index;
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
	private _onPage = (idx: number) =>{
		App.pub_playBtnTab();
		if(this._swiper) this._swiper.slideTo(idx);
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
		const wrap1 = document.querySelector('.s_additional .hard .q-item:nth-child(1) .scroll');
        const wrap2 = document.querySelector('.s_additional .hard .q-item:nth-child(2) .scroll');
        const wrap3 = document.querySelector('.s_additional .hard .q-item:nth-child(3) .scroll');
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
		if(keyBoardState.state === 'on'){
            wrap1?.scrollTo(0,235);
            wrap2?.scrollTo(0,235);
            wrap3?.scrollTo(0,235);
        }
	}

	public render() {
		const { view, data, prog } = this.props;
		const keyon = keyBoardState.state === 'on' ? ' key-on' : '';
		const alphabet = ['a','b','c'];
		let correct_list: Array<(''|'O'|'X')> = ['','',''];
		let OXs: Array<Array<(''|'O'|'X')>> = [['',''],['',''],['','']];
		
		if(prog === QPROG.COMPLETE) {
			data.map((quiz,idx) => {
				const answer_list = [quiz.sentence1.answer1, quiz.sentence1.answer2];
				OXs[idx][0] = (answer_list[0] === this._tarea[idx][0]?.value) ? 'O' : 'X';
				OXs[idx][1] = (answer_list[1] === this._tarea[idx][1]?.value) ? 'O' : 'X';
				
				correct_list[idx] = (OXs[idx][0] === 'O' && OXs[idx][1] === 'O') ? 'O' : 'X';
			});
		}
		return (
			<>
				<div className="s_additional" style={{ display: view ? '' : 'none' }}>
					<div className={"btn_page_box" + keyon}>
						{data.map((quiz, idx) => {
							return <NItem key={idx} on={idx === this._curIdx} idx={idx} onClick={this._onPage} />;
						})}
					</div>
					<div className="hard quiz_box">
						<SwiperComponent ref={this._refSwiper}>
							{data.map((quiz, idx) => {	
								return (
									<div key={idx} className={'q-item' + keyon}>
										<div className={"scroll" + keyon}>
											<div className="quiz">
												<WrapTextNew view={view}>
													{this._jsx_sentence}
												</WrapTextNew>
											</div>
											<div className="sentence_box">
												<div className={'OX_box ' + correct_list[idx]}/>
												<canvas/>
												<div className="question_box">
													<p>{idx + 1}.</p>
													<p>{_getJSX(quiz.sentence)}</p>
												</div>
											</div>
										</div>										
										<div className={"s_typing" + keyon} >
											<div className="area-bnd" onClick={() => this._selectArea(0)}>
												<div className={'answer_box ' + OXs[idx][0]}>
													{quiz.sentence1.answer1}
												</div>
												<KTextArea 
													ref={this._refArea[idx][0]} 
													view={view} 
													on={view && this._curIdx === idx && this._select_area === 0 && !this._sended}
													autoResize={true}
													skipEnter={false}
													onChange={(text: string) => this._onChange(text,0)}
													onDone={this._onDone}
													maxLength={60}
													maxLineNum={3}
													rows={1}
												/>
											</div>
											{' → '}
											<div className="area-bnd" onClick={() => this._selectArea(1)}>
												<div className={'answer_box ' + OXs[idx][1]}>
													{quiz.sentence1.answer2}
												</div>
												<KTextArea 
													ref={this._refArea[idx][1]} 
													view={view} 
													on={view && this._curIdx === idx && this._select_area === 1 && !this._sended}
													autoResize={true}
													skipEnter={false}
													onChange={(text: string) => this._onChange(text,1)}
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

export default SHardQuizItem;