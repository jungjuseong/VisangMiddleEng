import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { IStateCtx, IActionsCtx } from '../../t_store';

import { App } from '../../../../App';

import { IData } from '../../../common';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

import SupplementQuizBox from './_additional_supplement_quiz_box';
import BasicQuizBox from './_additional_basic_quiz_box';
import HardQuizBox from './_additional_hard_quiz_box';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBoxProps {
	view: boolean;
	index: number;
	actions: IActionsCtx;
	state: IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	mdata: IData;
	viewResult: () => void;
}
@observer
class AdditionalQuiz extends React.Component<IQuizBoxProps> {
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

 	public componentDidUpdate(prev: IQuizBoxProps) {
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
		const { mdata, view,index, onClosed, onHintClick ,actions, state, viewResult} = this.props;
		return (
			<>
				<SupplementQuizBox view={view && index === 0} actions={actions} state={state} data={mdata.additional_sup} onClosed={onClosed} onHintClick={onHintClick} viewResult={viewResult}/>
				<BasicQuizBox view={view && index === 1} actions={actions} state={state} data={mdata.additional_basic} onClosed={onClosed} onHintClick={onHintClick} viewResult={viewResult}/>
				<HardQuizBox view={view && index === 2} actions={actions} state={state} data={mdata.additional_hard} onClosed={onClosed} onHintClick={onHintClick} viewResult={viewResult}/>
			</>
		);
	}
}

export default AdditionalQuiz;