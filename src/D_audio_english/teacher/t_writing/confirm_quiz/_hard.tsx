import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import { SENDPROG, IStateCtx, IActionsCtx } from '../../t_store';

import { CorrectBar } from '../../../../share/Progress_bar';

import * as butil from '@common/component/butil';

import * as common from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBox {
	view: boolean;
	actions : IActionsCtx;
	state : IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	data: common.IConfirmHard;
}
@observer
class Hard extends React.Component<IQuizBox> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;
	@observable private _zoom = false;
	@observable private _zoomImgUrl = '';
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
	private _jsx_question1: common.IProblemHard;
	private _jsx_question2: common.IProblemHard;
	private _jsx_question3: common.IProblemHard;
	private _characterImage: string;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBox) {
		super(props);
		
		this._jsx_sentence = _getJSX(props.data.directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data.directive.eng); // 문제
		this._jsx_question1= props.data.problem1;
		this._jsx_question2= props.data.problem2;
		this._jsx_question3= props.data.problem3;
		
		const characterImages:Array<string> = ['letstalk_bear.png','letstalk_boy.png','letstalk_gir.png'];
		const pathPrefix = `${_project_}/teacher/images/`;

		const randomIndex = Math.floor(Math.random() * 3);
		this._characterImage = pathPrefix + characterImages[randomIndex];
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
	@action
	private _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		if(!this._hint){
			console.log('viewHint')
			this.props.onHintClick();
			this._hint = true;
	
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
	}

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;
		this._swiper = el.swiper;
	}

	private _refAudio = (btn: BtnAudio) => {
		if(this._btnAudio || !btn) return;
		this._btnAudio = btn;
	}

	private _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}

 	public componentDidUpdate(prev: IQuizBox) {
		const { view ,state} = this.props;
		const {confirmHardProg} = this.props.state;
		console.log('하드 didupdate', prev.state.confirmHardProg, state.confirmHardProg);
		if(view && !prev.view) {
			this._view = true;
			this._trans = false;
			this._zoom = false;
			this._zoomImgUrl = '';

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
			this._zoom = false;
			this._zoomImgUrl = '';
			App.pub_stop();
		}
		if(confirmHardProg >= SENDPROG.SENDED){
			this._sended = true;
		}
	}
	
	public render() {
		const { data, state} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		let qResult = -1;
        const isQComplete = state.confirmHardProg >= SENDPROG.COMPLETE;
		return (
			<>
			<div className="confirm_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={"subject_rate" + (this._sended ? '' : ' hide')}>{state.resultConfirmHard.uid.length}/{App.students.length}</div>
				<ToggleBtn className={"btn_example" + (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				
				<div className="quiz_box">
					<div className="white_board">
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									{jsx}
								<BtnAudio className={'btn_audio'} url={App.data_url + data.main_sound}/>
								</div>
							</div>
						</div>
						<div className = "hard_question">
							<div>
								<div>1. {this._jsx_question1.question}</div>
								<div className="answer_box">
									<div className={'sample' + (this._hint ? ' hide' : '')}/>
									<div className={'hint' + (this._hint ? '' : ' hide')}>
										{butil.parseBlock(this._jsx_question1.answer, 'block')}
									</div>
								</div>
							</div>
							<div>
								<div>2. {this._jsx_question2.question}</div>
								<div className="answer_box">
									<div className={'sample' + (this._hint ? ' hide' : '')}/>
									<div className={'hint' + (this._hint ? '' : ' hide')}>
									{butil.parseBlock(this._jsx_question2.answer, 'block')}
									</div>
								</div>
							</div>
							<div>
								<div>3. {this._jsx_question3.question}</div>
								<div className="answer_box">
									<div className={'sample' + (this._hint ? ' hide' : '')}/>
									<div className={'hint' + (this._hint ? '' : ' hide')}>
									{butil.parseBlock(this._jsx_question3.answer, 'block')}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default Hard;