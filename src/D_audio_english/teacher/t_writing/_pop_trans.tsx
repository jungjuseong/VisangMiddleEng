import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import { observer, Observer } from 'mobx-react';
import { observable, observe } from 'mobx';

import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';

import { CoverPopup } from '../../../share/CoverPopup';
import { IScript } from '../../common';
import { BtnAudio } from '../../../share/BtnAudio';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';

interface IQuizBoxProps {
	view: boolean;
	onClosed: () => void;
	data: IScript[];
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

    private _jsx_sentences: Array<{eng: JSX.Element, kor: JSX.Element}> = [];
	// private _jsx_kor_sentences: JSX.Element[] = [];

	private readonly _Characters = ['letstalk_bear.png','letstalk_boy.png','letstalk_girl.png'];
	private _character: string = _project_ + 'teacher/images/' + this._Characters[Math.floor(Math.random() * 3)];
	private _btnAudio?: BtnAudio;

	public constructor(props: IQuizBoxProps) {
		super(props);
		
		for(let sentence of props.data) {
			this._jsx_sentences.push({eng: _getJSX(sentence.dms_eng), kor: _getJSX(sentence.dms_kor)});
		}
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
		const { view } = this.props;
		if(view && !prev.view) {
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

		} else if(!view && prev.view) {
			this._view = false;	
			App.pub_stop();
		}
	}
	
	public render() {
		const { onClosed } = this.props;

		return (
			<>
			<CoverPopup className="pop_trans" view={this._view} onClosed={onClosed} >
				<div className="pop_bg">
					<ToggleBtn className="btn_letstalk_close" onClick={this._onClosepop}/>
						<div className="popbox">
							<div className="sentence_box">
								<div>
								{this._jsx_sentences.map((sentence, key) => 
										(<>
										<div className="question_box" onClick={this._onClick}>{sentence.eng}</div>
										<div className="kor_question_box" onClick={this._onClick}>{sentence.kor}</div>
										</>)
									)
								}
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