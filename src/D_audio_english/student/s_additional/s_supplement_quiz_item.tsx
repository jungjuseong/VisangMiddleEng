import * as React from 'react';

import { QPROG } from '../s_store';
import { IAdditionalSup } from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { state as keyBoardState } from '@common/component/Keyboard';
import { KTextArea } from '@common/component/KTextArea';
import TableItem from './table-item';
import { App } from '../../../App';

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
	data: IAdditionalSup[];
	prog: QPROG;
	onChoice: (idx: number, choice: number|string, subidx: number) => void;
}
@observer
class SSupplementQuizItem extends React.Component<IQuizItemProps> {	
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

	public constructor(props: IQuizItemProps) {
		super(props);
		this._jsx_sentence = _getJSX(props.data[0].directive.kor);
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng);

		keyBoardState.state = 'hide';
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
		const {view, prog} = this.props;
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
		if(prog === QPROG.COMPLETE && prev.prog < QPROG.COMPLETE) {
			if(this._swiper) {
				this._swiper.slideTo(0);
			}			
		}
		if(prog >= QPROG.SENDED && this.props.view) {
			this._sended = true;
			keyBoardState.state = 'hide';
		}
	}

	public render() {
		const { view, data ,prog, onChoice} = this.props;
		let OXs: Array<''|'O'|'X'> = ['','',''];
		if(prog === QPROG.COMPLETE) {
			data.map((quiz, idx) => {
				let correct_count = 0;
				const answer_arr = [quiz.app_drops[0],quiz.app_drops[1],quiz.app_drops[2]];
				{
					answer_arr.map((answer, index) => {
						if(answer.correct === answer.inputed) correct_count += 1;
					});
				}
				OXs[idx] = (correct_count === answer_arr.length) ? 'O' : 'X';
			});
		}
		return (
			<>
				<div className="s_additional" style={{ display: view ? '' : 'none' }}>
					<div className={"btn_page_box"}>
						{data.map((quiz, idx) => {
							return <NItem key={idx} on={idx === this._curIdx} idx={idx} onClick={this._onPage} />;
						})}
					</div>
					<div className="supplement">
						<SwiperComponent ref={this._refSwiper}>
							{data.map((quiz, idx) => {
								return (
									<div key={idx} className="table_box">
										<div className="quiz">
											<WrapTextNew view={view}>
												{this._jsx_sentence}
											</WrapTextNew>
										</div>
										<div className={'OX_box ' + OXs[idx]}/>
										<TableItem
											className="type_3"
											viewCorrect={false}
											disableSelect={prog === QPROG.COMPLETE}
											viewResult={prog === QPROG.COMPLETE}
											inview={view}
											graphic={quiz}
											maxWidth={1000}
											renderCnt={this._renderCnt}
											optionBoxPosition="bottom"
											viewBtn={false}
											idx={idx}
											onChoice={onChoice}
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

export default SSupplementQuizItem;