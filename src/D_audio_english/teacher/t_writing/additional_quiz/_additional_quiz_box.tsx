import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { App } from '../../../../App';
import { IAdditionalBasic,IAdditionalHard,IAdditionalSup } from '../../../common';

import { IStateCtx, IActionsCtx, SENDPROG } from '../../t_store';
import { BtnAudio } from '../../../../share/BtnAudio';
import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

export interface IQuizBoxProps {
	view: boolean;
	actions: IActionsCtx;
	state: IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	data: IAdditionalBasic[] | IAdditionalHard[] | IAdditionalSup[];
}

@observer
class QuizBox extends React.Component<IQuizBoxProps> {
	@observable protected _view = false;
	@observable protected _hint = false;
	@observable protected _trans = false;
	@observable protected _sended = false;

	protected _swiper?: Swiper;

	protected _characterImage: string;
	protected _btnAudio?: BtnAudio;
	
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
	
	protected _jsx_kor_sentence: JSX.Element;
	protected _jsx_eng_sentence: JSX.Element;

	public constructor(props: IQuizBoxProps) {
		super(props);

		const characterImages: string[] = ['letstalk_bear.png','letstalk_boy.png','letstalk_gir.png'];
		const pathPrefix = `${_project_}/teacher/images/`;

		const randomIndex = Math.floor(Math.random() * 3);
		this._characterImage = pathPrefix + characterImages[randomIndex];

		const fist_directive = props.data[0].directive;
		this._jsx_kor_sentence = _getJSX(fist_directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(fist_directive.eng); // 문제
	}

	protected _doSwipe() {
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

	// Translation 토글 기능
	protected _viewTrans = () => {
		App.pub_playBtnTab();
		this._trans = !this._trans;
		if(this._trans) this._trans = true;

		this._doSwipe();
	}

	// 답 확인 토글 기능 answer
	protected _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		console.log('viewHint');

		this.props.onHintClick();
		this._hint = !this._hint;

		this._doSwipe();
	}

	protected _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}

 	public componentDidUpdate(prev: IQuizBoxProps) {
		const { view ,state } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._hint = false;
			this._trans = false;

			this._doSwipe();

		} else if(!view && prev.view) {
			this._view = false;	
			App.pub_stop();
		}

		if(state.additionalBasicProg >= SENDPROG.SENDED || 
			state.additionalHardProg >= SENDPROG.SENDED ||
			state.additionalSupProg >= SENDPROG.SENDED) this._sended = true;

	}
	
	public render() {
		return ({/* */});
	}
}

export default QuizBox;