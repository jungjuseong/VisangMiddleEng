import * as React from 'react';
import { observer } from 'mobx-react';

import * as _ from 'lodash';

import { App } from '../../App';
import { ToggleBtn } from '@common/component/button';

import * as common from '../common';
import { observable } from 'mobx';
import { CoverPopup } from '../../share/CoverPopup';

import WrapTextNew from '@common/component/WrapTextNew';
import { BtnAudio } from '../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

interface ILetsTalk {
	view: boolean;
	onClosed: () => void;
	data: common.IAdditionalQuiz[];
}
@observer
class AdditionalPopQuiz extends React.Component<ILetsTalk> {
	@observable private _view = false;
	@observable private _answer = false;
	@observable private _toggle: Array<boolean|null> = [null,null,null,null,null,null,null];
	
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
	private _character: string;
	private _disable_toggle: boolean;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: ILetsTalk) {
        super(props);
        
        this._jsx_sentence = _getJSX(props.data[0].directive_kor);
		this._disable_toggle = false;

        const rnd = Math.floor(Math.random() * 3);
        if(rnd === 0) this._character = _project_ + 'teacher/images/letstalk_bear.png';
        else if(rnd === 1) this._character = _project_ + 'teacher/images/letstalk_boy.png';
        else this._character = _project_ + 'teacher/images/letstalk_girl.png';
    }
    
	private _viewAnswer = () => {
		if (this._disable_toggle === false){
			App.pub_playBtnTab();
			// this._toggle[0] = this._answer_dic[`${this._jsx_question1_answer}`];
			// this._toggle[1] = this._answer_dic[`${this._jsx_question2_answer}`];
			// this._toggle[2] = this._answer_dic[`${this._jsx_question3_answer}`];
			this._disable_toggle = true;
			this._answer = true;

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

	private _getToggleState = (num: number) =>{
		if(this._answer){
			if(this._toggle[num] === null) return '';
			if(this._toggle[num])
				return 'on_true_t';
			else
				return 'on_false_t';
		}
		if(this._toggle[num] === null) return '';
		if(this._toggle[num])
			return 'on_true';
		else
			return 'on_false';
	}
	private _onClickTrue = (param:number) =>{
		if (this._disable_toggle) return;
		this._toggle[param] = true;
	}
	private _onClickFalse = (param:number) =>{
		if (this._disable_toggle) return;
		this._toggle[param] = false;
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

 	public componentDidUpdate(prev: ILetsTalk) {
		if(this.props.view && !prev.view) {
			this._view = true;
			this._answer = false;
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
		const quiz_list = [1,2,3,4,5,6,7]; // 임시

		return (
			<>
			<CoverPopup className="lets_talk" view={this._view} onClosed={onClosed} >
				<div className="pop_bg">
					<ToggleBtn className="btn_answer" on={this._answer} onClick={this._viewAnswer}/>
					<div className="popbox">
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									<div>{this._jsx_sentence}</div>
								</div>
							</div>
						</div>
						<div className="quiz_box">
							{data.map((quiz, idx)=>{
								return(
									<div key={idx}>
										<p>{idx + 1}. {quiz.question}</p>
										<div className={"toggle_bundle " + this._getToggleState(idx)}>
											<div className="true" onClick={()=>{this._onClickTrue(idx)}}></div>
											<div className="false" onClick={()=>{this._onClickFalse(idx)}}></div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
    			</div>
				<ToggleBtn className="btn_back" onClick={this._onClosepop}/>
			</CoverPopup>
			</>
		);
	}
}

export default AdditionalPopQuiz;