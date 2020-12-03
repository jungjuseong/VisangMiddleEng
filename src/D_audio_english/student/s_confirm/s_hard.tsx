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
	data: common.IConfirmHard;
	confirmProg: QPROG;
	onChoice: (idx: number, choice: number) => void;
}
@observer
class QuizItem extends React.Component<IQuizItem> {
	private _bndW = 0;
	private _bndH = 0;
	private _bndW_p = 0;
	private _bndH_p = 0;

	private _tarea: (KTextArea|null)[] = [null,null,null];
	private _canvas?: HTMLCanvasElement;
	private _ctx?: CanvasRenderingContext2D;
	
	@observable private _tlen = 0;

    private _stime = 0;
	
	@observable private _toggle: Array<boolean | null> = [null, null, null];
	@observable private _curIdx = 0;
	@observable private _answer: boolean;
	@observable private _swiper: Swiper|null = null;
 
	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _jsx_question1: common.IProblemHard;
	private _jsx_question2: common.IProblemHard;
	private _jsx_question3: common.IProblemHard;

	public constructor(props: IQuizItem) {
		super(props);
		this._jsx_sentence = _getJSX(props.data.directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data.directive.eng); // 문제
		this._jsx_question1 = props.data.problem1;
		this._jsx_question2 = props.data.problem2;
		this._jsx_question3 = props.data.problem3;

		this._answer = true;
		keyBoardState.state = 'hide';
	}

	private _onChange = (text: string) => {
		if(this._stime === 0) this._stime = Date.now();
		
		if(!this.props.view) return;
		this.props.choice
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

	private _onChoice = (choice: number) => {
		this.props.onChoice(this.props.idx, choice);
	}
	public componentDidUpdate(prev: IQuizItem) {
		if(this.props.view && !prev.view) {
			this._bndH_p = 0;
			this._bndW_p = 0;
			this._tlen = 0;
			keyBoardState.state = 'on';
			
			// if(this._tarea) this._tarea.
			this._stime = 0;
		} else if(!this.props.view && prev.view) {
			this._bndH_p = 0;
			this._bndW_p = 0;
			this._tlen = 0;
			keyBoardState.state = 'hide';
		}
	}

	public render() {
		// const {view, idx, choice, confirm_normal, confirmProg} = this.props;
		const { view, confirmProg } = this.props;
		const keyon = keyBoardState.state === 'on' ? ' key-on' : '';
		const quizs = [this._jsx_question1, this._jsx_question2, this._jsx_question3]
		console.log('mdmaskdmasldk' + this._curIdx)
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					{/* <div className="hard_question"> */}
						<SwiperComponent
						ref={this._refSwiper}
						>
							<div key={0} className= {"q-item" + keyon}>1
									</div>
									<div key={1} className= {"q-item" + keyon}>2
										
									</div>
							{/* {quizs.map((quiz, idx) => {
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
												<p>{idx + 1}.{quizs[idx].question}</p>
												<p>{_getBlockJSX(quiz.hint)}</p>
											</div>
										</div>
										<div className="s_typing" >
											<div className="area-bnd">
												<canvas ref={this._refCanvas}/>
												<KTextArea 
													ref={this._refArea[idx]} 
													view={this.props.view} 
													on={this.props.view && idx ===1}
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
							})} */}
						</SwiperComponent>
						<Keyboard />
					{/* </div> */}
				</div>
			</>
		);
	}
}

export default QuizItem;