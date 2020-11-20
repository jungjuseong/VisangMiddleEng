import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../App';

import * as common from '../../common';
import { BtnAudio } from '../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBox {
	view: boolean;
	onClosed: () => void;
	data: common.IIntroduction;
}
@observer
class IntroQuiz extends React.Component<IQuizBox> {
	@observable private _view = false;
	@observable private _hint = false;
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
	private _jsx_hint: JSX.Element;
	private _character: string;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBox) {
		super(props);
		
		this._jsx_sentence = _getJSX(props.data.questions); // 문제
		this._jsx_hint = _getJSX(props.data.ex_answer); // 답

		const randomIndex = Math.floor(Math.random() * 3);
		if(randomIndex === 0) this._character = _project_ + 'teacher/images/letstalk_bear.png';
		else if(randomIndex === 1) this._character = _project_ + 'teacher/images/letstalk_boy.png';
		else this._character = _project_ + 'teacher/images/letstalk_girl.png';
	}

	private _viewAnswer = () => {
		App.pub_playBtnTab();
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
		return (
			<>
			<div className="intro_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<ToggleBtn className="btn_answer" on={this._hint} onClick={this._viewAnswer}/>
				<div className="quiz_box">
					<div className="white_board">
						<div className="image_box">
							<img  src={App.data_url + data.img} draggable={false}/>
						</div>	
					</div>
					<div className="sentence_box">
						<div>
							<div className="question_box" onClick={this._onClick}>
								{this._jsx_sentence}
							</div>
						</div>
					</div>
					<div className="speechbubble_box" >
						<div className={(this._hint ? ' view-hint' : '')}>
							<div className={'sample' + (this._hint ? ' hide' : '')}/>
							<div className={'hint' + (this._hint ? '' : ' hide')}>
								{this._jsx_hint}
							</div>
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default IntroQuiz;