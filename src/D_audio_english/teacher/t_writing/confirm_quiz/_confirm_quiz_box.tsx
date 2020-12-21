import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { App } from '../../../../App';

import { SENDPROG, IStateCtx, IActionsCtx } from '../../t_store';
import { IConfirmHard, IConfirmNomal,IConfirmSup } from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

export interface IConfirmQuizBoxProps {
	view: boolean;
	actions: IActionsCtx;
	state: IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	data: IConfirmNomal | IConfirmHard | IConfirmSup;
	viewResult: (answerboolean : boolean) => void;

}

@observer
class ConfirmQuizBox extends React.Component<IConfirmQuizBoxProps> {
	@observable protected _view = false;
	@observable protected _hint = false;
	@observable protected _trans = false;
	@observable protected _sended = [false,false,false];
	
	protected _swiper?: Swiper;

	protected _jsx_sentence: JSX.Element;
	protected _jsx_eng_sentence: JSX.Element;
	protected _characterImage = '';
	protected _btnAudio?: BtnAudio;
	
	protected readonly _soption: SwiperOptions = {
		direction: 'vertical',
		observer: true,
		slidesPerView: 'auto',
		freeMode: true,
		mousewheel: true,			
		noSwiping: false,
		followFinger: true,
		scrollbar: {el: '.swiper-scrollbar',draggable: true, hide: false},	
	};

	public constructor(props: IConfirmQuizBoxProps) {
		super(props);
		
		const { directive } = props.data;
		this._jsx_sentence = _getJSX(directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(directive.eng); // 문제

		const characterImages = ['letstalk_bear.png','letstalk_boy.png','letstalk_gir.png'];
		const pathPrefix = `${_project_}/teacher/images/`;

		const randomIndex = Math.floor(Math.random() * 3);
		this._characterImage = pathPrefix + characterImages[randomIndex];
	}

	// protected _doSwipe = () => {
	// 	if(this._swiper) {
	// 		this._swiper.slideTo(0, 0);
	// 		this._swiper.update();
	// 		if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
	// 	}
	// 	_.delay(() => {
	// 		if(this._swiper) {
	// 			this._swiper.slideTo(0, 0);
	// 			this._swiper.update();
	// 			if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
	// 		}				
	// 	}, 300);
	// }

	protected _viewTrans = () => {
		App.pub_playBtnTab();
		this._trans = !this._trans;
		if(this._trans) this._trans = true;

		// this._doSwipe();
	}

	@action
	protected _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		/** */
		this.props.onHintClick();
		this._hint = !this._hint;
	}

 	public componentDidUpdate(prev: IConfirmQuizBoxProps) {
		const { view , state } = this.props;
		if(view && !prev.view) {
			this._view = true;
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

		} else if(!view && prev.view) {
			this._view = false;	
			App.pub_stop();
		}
		if(state.confirmSupProg >= SENDPROG.SENDED){
			this._sended[0] = true;
		}
		if(state.confirmBasicProg >= SENDPROG.SENDED){
			this._sended[1] = true;
		}
		if(state.confirmHardProg >= SENDPROG.SENDED){
			this._sended[2] = true;
		}
	}
	
	public render() { 
		return (<></>);
	}
}

export default ConfirmQuizBox;