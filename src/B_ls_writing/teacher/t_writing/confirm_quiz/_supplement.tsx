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
/*
2020 11 16 작업
_lets_talk.tsx 참고
이동윤
*/
@observer
class Supplement extends React.Component<IQuizBox> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;
	@observable private _select = true;
	@observable private _zoom = false;
	@observable private _zoomImgUrl = '';
	
	private _swiper?: Swiper;

	private _soption: SwiperOptions = {
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
	private _jsx_question1: common.IProblem;
	private _jsx_question2: common.IProblem;
	private _jsx_question3: common.IProblem;
	private _character: string;
	private aaaclick : () => void;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBox) {
		super(props);
		
		this._jsx_sentence = _getJSX(props.data.directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data.directive.eng); // 문제
		this._jsx_question1= props.data.problem1;
		this._jsx_question2= props.data.problem2;
		this._jsx_question3= props.data.problem3;
		this.aaaclick = props.onHintClick;

		const randomIndex = Math.floor(Math.random() * 3);
		if(randomIndex === 0) this._character = _project_ + 'teacher/images/letstalk_bear.png';
		else if(randomIndex === 1) this._character = _project_ + 'teacher/images/letstalk_boy.png';
		else this._character = _project_ + 'teacher/images/letstalk_girl.png';
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
	// True / False 토글 기능
	private _selectedValue = () => {
		App.pub_playBtnTab();
		this._select = !this._select;
		if(this._select) this._select = true;

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
		console.log('viewHint')
		this.aaaclick();
		this._hint = !this._hint;

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
		return (
			<>
			<div className="question_bg" style={{ display: this._view ? '' : 'none' }}>
			<div className="sub_rate"></div>
				<ToggleBtn className="correct_answer" on={this._hint} onClick={this._viewAnswer}/>
					<div className="quiz_box">
						<div className="white_board">
							<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
							<div className="sentence_box">
								<div>
									<div className="question_box" onClick={this._onClick}>
										{jsx}
									</div>
								</div>
							</div>
							<div className = "question">
								<div>
									<div>1. {this._jsx_question1.question}</div>
									<ToggleBtn className="true_false_btn" on={this._select} onClick={this._selectedValue}/>
								</div>
								<div>
									<div>2. {this._jsx_question2.question}</div>
									<ToggleBtn className="true_false_btn" on={this._select} onClick={this._selectedValue}/>
								</div>
								<div>
									<div>3. {this._jsx_question3.question}</div>
									<ToggleBtn className="true_false_btn" on={this._select} onClick={this._selectedValue}/>
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