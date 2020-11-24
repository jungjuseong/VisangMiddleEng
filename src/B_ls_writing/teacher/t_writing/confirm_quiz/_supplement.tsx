import * as React from 'react';
import * as _ from 'lodash';
import { observer, PropTypes } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import * as common from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';
import ProgBox from 'src/B_rw_comprehension/teacher/t_video_box/_prog_box';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBox {
	view: boolean;
	onClosed: () => void;
	onHintClick: () => void;
	data: common.IConfirmSup;
}
@observer
class Supplement extends React.Component<IQuizBox> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;
	@observable private _listen = false;
	@observable private _select = true;
	@observable private _toggle: Array<boolean|null> = [null,null,null];
	@observable private _quiz: Array<string> = [];
	@observable private _zoom = false;
	@observable private _zoomImgUrl = '';
	
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
	private _jsx_question1: common.IProblemSup;
	private _jsx_question2: common.IProblemSup;
	private _jsx_question3: common.IProblemSup;
	private _jsx_question1_answer: number;
	private _jsx_question2_answer: number;
	private _jsx_question3_answer: number;
	private	_answer_dic: {};
	private _disable_toggle: boolean
	private _characterImage: string;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBox) {
		super(props);
		
		this._jsx_sentence = _getJSX(props.data.directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data.directive.eng); // 문제
		this._jsx_question1= props.data.problem1;
		this._jsx_question2= props.data.problem2;
		this._jsx_question3= props.data.problem3;
		this._jsx_question1_answer= props.data.problem1.answer;
		this._jsx_question2_answer= props.data.problem2.answer;
		this._jsx_question3_answer= props.data.problem3.answer;
		this._answer_dic = {1:true, 2:false};
		this._disable_toggle = false;
		
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

	private _onClickTrue = (param: 0 | 1 | 2) =>{
		if (this._disable_toggle) return;
		if(this._btnAudio) this._btnAudio.toggle();
		this._toggle[param] = true;
	}
	private _onClickFalse = (param: 0 | 1 | 2) =>{
		if (this._disable_toggle) return;
		if(this._btnAudio) this._btnAudio.toggle();
		this._toggle[param] = false;
	}
	private _getToggleState = (num: number) =>{
		if(this._toggle[num] === null) return '';
		if(this._toggle[num])
			return 'on_true';
		else
			return 'on_false';
	}

	// 답 확인 토글 기능 answer
	private _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		this.props.onHintClick();
		if (this._disable_toggle === false){
			this._toggle[0] = this._answer_dic[`${this._jsx_question1_answer}`];
			this._toggle[1] = this._answer_dic[`${this._jsx_question2_answer}`];
			this._toggle[2] = this._answer_dic[`${this._jsx_question3_answer}`];
			this._disable_toggle = true;
		}

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
		const { view } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._hint = false;
			this._trans = false;
			this._listen = false;
			this._select = true;
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
	}
	
	public render() {
		const { data, } = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		this._quiz.push("")
		return (
			<>
			<div className="confirm_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className="subject_rate"></div>
				<div className="correct_answer_rate"></div>
				<ToggleBtn className="btn_answer" on={this._hint} onClick={this._viewAnswer}/>
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
						<div className = "sup_question">
							<div>
								<div>1. {this._jsx_question1.question}</div>
								<div className={"toggle_bundle " + this._getToggleState(0)}>
									<div className="true" onClick={()=>{this._onClickTrue(0)}}></div>
									<div className="false" onClick={()=>{this._onClickFalse(0)}}></div>
								</div>
							</div>
							<div>
								<div>2. {this._jsx_question2.question}</div>
								<div className={"toggle_bundle " + this._getToggleState(1)}>
									<div className="true" onClick={()=>{this._onClickTrue(1)}}></div>
									<div className="false" onClick={()=>{this._onClickFalse(1)}}></div>
								</div>
							</div>
							<div>
								<div>3. {this._jsx_question3.question}</div>
								<div className={"toggle_bundle " + this._getToggleState(2)}>
									<div className="true" onClick={()=>{this._onClickTrue(2)}}></div>
									<div className="false" onClick={()=>{this._onClickFalse(2)}}></div>
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

export default Supplement;