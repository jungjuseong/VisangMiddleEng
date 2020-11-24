import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import { observer, Observer } from 'mobx-react';
import { observable, observe } from 'mobx';

import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';

import { CoverPopup } from '../../../share/CoverPopup';
import * as common from '../../common';
import { BtnAudio } from '../../../share/BtnAudio';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';

interface IQuizBoxProps {
	view: boolean;
	onClosed: () => void;
	data: common.IScript[];
}
@observer
class PopTranslation extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _hint = false;
	
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

    private _jsx_sentence1: JSX.Element;
    private _jsx_sentence2: JSX.Element;
    private _jsx_sentence3: JSX.Element;
    private _jsx_kor_sentence1: string;
    private _jsx_kor_sentence2: string;
    private _jsx_kor_sentence3: string;
	private _character: string;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBoxProps) {
        super(props);
        
		this._jsx_sentence1 = _getJSX(props.data[0].dms_eng); // 문제
		this._jsx_sentence2 = _getJSX(props.data[1].dms_eng); // 문제
		this._jsx_sentence3 = _getJSX(props.data[2].dms_eng); // 문제
		this._jsx_kor_sentence1 = props.data[0].dms_kor; // 문제
		this._jsx_kor_sentence2 = props.data[1].dms_kor; // 문제
		this._jsx_kor_sentence3 = props.data[2].dms_kor; // 문제

		const rnd = Math.floor(Math.random() * 3);
		if(rnd === 0) this._character = _project_ + 'teacher/images/letstalk_bear.png';
		else if(rnd === 1) this._character = _project_ + 'teacher/images/letstalk_boy.png';
		else this._character = _project_ + 'teacher/images/letstalk_girl.png';
	}


	private _viewHint = () => {
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

	private _onClosepop = () => {
		App.pub_playBtnTab();
		this._view = false;
	}

	private _refAudio = (btn: BtnAudio) => {
		if(this._btnAudio || !btn) return;
		this._btnAudio = btn;
	}

	private _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}

 	public componentDidUpdate(prev: IQuizBoxProps) {
		if(this.props.view && !prev.view) {
			this._view = true;
			this._hint = false;
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
	}
	
	public render() {
		const { view, onClosed, data, } = this.props;

		return (
			<>
			<CoverPopup className="pop_trans" view={this._view} onClosed={onClosed} >
				<div className="pop_bg">
					<ToggleBtn className="btn_letstalk_close" onClick={this._onClosepop}/>
						<div className="popbox">
							<div className="sentence_box">
								<div>
									<div className="question_box" onClick={this._onClick}>
										{this._jsx_sentence1}
									</div>
									<div className="kor_question_box" onClick={this._onClick}>
										{this._jsx_kor_sentence1}
									</div>
									<div className="question_box" onClick={this._onClick}>
										{this._jsx_sentence2}
									</div>
									<div className="kor_question_box" onClick={this._onClick}>
										{this._jsx_kor_sentence2}
									</div>
									<div className="question_box" onClick={this._onClick}>
										{this._jsx_sentence3}
									</div>
									<div className="kor_question_box" onClick={this._onClick}>
										{this._jsx_kor_sentence3}
									</div>
								</div>
							</div>
						</div>
					{/* </SwiperComponent> */}
				</div>
			</CoverPopup>
			</>
		);
	}
}
export default PopTranslation;