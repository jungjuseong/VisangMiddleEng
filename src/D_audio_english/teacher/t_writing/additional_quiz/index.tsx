import * as React from 'react';
import * as _ from 'lodash';
import { observer, PropTypes } from 'mobx-react';
import { observable } from 'mobx';

import { SENDPROG, IStateCtx, IActionsCtx } from '../../t_store';

import { App } from '../../../../App';

import * as common from '../../../common';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

import Supplement from './_supplement';
import Basic from './_basic';
import Hard from './_hard';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBox {
	view: boolean;
	index: number;
	actions: IActionsCtx;
	state:IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	mdata: common.IData;
}
@observer
class AdditionalQuiz extends React.Component<IQuizBox> {
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
		const { mdata, view,index, onClosed, onHintClick ,actions, state} = this.props;
		return (
			<>
				<Supplement view={view && index === 0} actions={actions} state={state} data={mdata.additional_sup} onClosed={onClosed}	onHintClick={onHintClick}/>
				<Basic view={view && index === 1} actions={actions} state={state} data={mdata.additional_basic} onClosed={onClosed}	onHintClick={onHintClick}/>
				<Hard view={view && index === 2} actions={actions} state={state} data={mdata.additional_hard} onClosed={onClosed}	onHintClick={onHintClick}/>
			</>
		);
	}
}

export default AdditionalQuiz;