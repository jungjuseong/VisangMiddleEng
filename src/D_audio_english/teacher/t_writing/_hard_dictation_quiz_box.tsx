import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../App';

import { SENDPROG, IStateCtx, IActionsCtx } from '../t_store';
import { IDictation } from '../../common';
import { BtnAudio } from '../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../get_jsx';
import { CorrectBar } from '../../../share/Progress_bar';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBoxProps {
	view: boolean;
	actions: IActionsCtx;
	state: IStateCtx;
	index: number;
	onClosed: () => void;
	onHintClick: () => void;
	data: IDictation[];
}
@observer
class HardDictationQuizBox extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;
	@observable private _sended = false;
	
	private _swiper?: Swiper;

	private readonly _soption: SwiperOptions = {
		direction: 'vertical',
		observer: true,
		slidesPerView: 'auto',
		freeMode: true,
		mousewheel: true,			
		noSwiping: false,
		followFinger: true,
		scrollbar: {el: '.swiper-scrollbar',draggable: true, hide: false},	
	};

	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _jsx_question: string[] = [];
	private _jsx_question_answers: string[][] = [];

	private boxnum: number;

	private _characterImage: string;

	private _boxs: Array<HTMLDivElement|null>;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBoxProps) {
		super(props);

		this._boxs = [null,null,null];
		this.boxnum = 0;
		this._jsx_sentence = _getJSX(props.data[0].directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng); // 문제

		props.data.forEach((data,idx) => {
			this._jsx_question.push(data.sentence);
			this._jsx_question_answers.push([props.data[idx].sentence1.answer1, props.data[idx].sentence2.answer1, props.data[idx].sentence3.answer1, props.data[idx].sentence4.answer1]);
		});
		
		const characterImages = ['letstalk_bear.png','letstalk_boy.png','letstalk_gir.png'];
		const pathPrefix = `${_project_}/teacher/images/`;

		const randomIndex = Math.floor(Math.random() * 3);
		this._characterImage = pathPrefix + characterImages[randomIndex];
	}

	private refText = (el: HTMLDivElement, idx: number) => {
		if(this._boxs[idx] || !el) return;
		this._boxs[idx] = el;
	}
	
	// Translation 토글 기능
	private _viewTrans = () => {
		App.pub_playBtnTab();
		this._trans = !this._trans;
		if(this._trans) this._trans = true;

		if(this._swiper) {
			this._swiper.slideTo(0, 0);
			this._swiper.update();
			if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
		}
		_.delay(() => {
			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
			}				
		}, 300);
	}
	// 답 확인 토글 기능 answer
	private _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		this.props.onHintClick();
		this._hint = !this._hint;

		if(!this._boxs) return;

		this._boxs.forEach((box, idx) => {
			const answer: string[] = this._jsx_question_answers[idx];
			if(box) {
				const blocks = box.querySelectorAll('.block');
				if(!blocks) return;

				blocks.forEach((block, index) => {
					while(block.lastChild) block.removeChild(block.lastChild);
					block.appendChild(document.createTextNode(answer[index]));
				});
			}
		});
		// if(this._swiper) {
		// 	this._swiper.slideTo(0, 0);
		// 	this._swiper.update();
		// 	if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
		// }
		// _.delay(() => {
		// 	if(this._swiper) {
		// 		this._swiper.slideTo(0, 0);
		// 		this._swiper.update();
		// 		if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
		// 	}				
		// }, 300);
	}
	private _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}

 	public componentDidUpdate(prev: IQuizBoxProps) {
		const { view ,state,index } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._hint = false;
			this._trans = false;

			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
			}
			_.delay(() => {
				if(this._swiper) {
					this._swiper.slideTo(0, 0);
					this._swiper.update();
					if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
				}				
			}, 300);

		} else if(!this.props.view && prev.view) {
			this._view = false;	
			App.pub_stop();
		}

		if(state.dictationProg[index] >= SENDPROG.SENDED) {
			this._sended = true;
		}
	}
	
	public render() {
		const { data, state, index} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		let qResult = -1;
		const isQComplete = state.dictationProg[index] >= SENDPROG.COMPLETE;

		if(isQComplete) {
			qResult = (state.numOfStudent > 0) ? Math.round(100 * state.resultDictation[index].arrayOfCorrect.filter((it) => it === true).length / state.numOfStudent) : 0;
			if(qResult > 100) qResult = 100;
		}
		return (
			<>
			<div className="dict_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + (this._sended ? '' : ' hide')}>{state.resultDictation[index].uid.length}/{App.students.length}</div>
				<ToggleBtn className={'btn_answer' + (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				<CorrectBar 
					className={'correct_answer_rate' + (this._sended ? '' : ' hide')} 
					preview={-1} 
					result={qResult}
				/>
				<div className="quiz_box">
					<div className="white_board">
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									{jsx}
								<BtnAudio className={'btn_audio'} url={App.data_url + data[0].main_sound}/>	
								</div>
							</div>
						</div>
						<div className="dict_question" >
							{this.props.data.map((item,idx) => {
								this.boxnum = idx;
								return (<div key={idx} className="blank_sentence" ref={(el: HTMLDivElement) => this.refText(el,idx)}>
									<p>{idx + 1}.</p>
									<p>{_getJSX(this._jsx_question[idx])}</p>
								</div>);
							})}
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default HardDictationQuizBox;