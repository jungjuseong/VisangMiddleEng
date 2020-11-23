import * as React from 'react';
import * as _ from 'lodash';
import { observer, PropTypes } from 'mobx-react';
import { action, observable } from 'mobx';

import { App } from '../../../../App';

import * as common from '../../../common';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

import PopTrans from './_pop_trans';
import { ToggleBtn } from '@common/component/button';
const SwiperComponent = require('react-id-swiper').default;

interface IQuizBox {
	view: boolean;
	index: number;
	onClosed: () => void;
	onHintClick: () => void;
	mdata: common.IData;
}
@observer
class ConfirmQuiz extends React.Component<IQuizBox> {
	@observable private _popTrans = false;
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;
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

	@action
	private _onLetsTalk = (evt: React.MouseEvent<HTMLElement>) => {
		this._popTrans = !this._popTrans;

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

 	public componentDidUpdate(prev: IQuizBox) {
		const { view } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._hint = false;
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

		} else if(!view && prev.view) {
			this._view = false;	
			this._zoom = false;
			this._zoomImgUrl = '';
			App.pub_stop();
		}
	}
	
	public render() {
		const { mdata, view,index, onClosed, onHintClick} = this.props;
		
		return (
			<>
				<ToggleBtn className="btn_lets_talk" view={true} on={this._popTrans} onClick={this._onLetsTalk} />
				<PopTrans 
                    view={this._popTrans} 
                    data={mdata.script} 
                    onClosed={onClosed}
                />
			</>
		);
	}
}

export default ConfirmQuiz;