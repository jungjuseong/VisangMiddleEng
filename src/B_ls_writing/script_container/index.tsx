import * as React from 'react';
import { observer } from 'mobx-react';

import * as common from '../common';

const SwiperComponent = require('react-id-swiper').default;

interface IScriptContainer {
	data: common.IData;
	focusIdx: number;
	selected: number[];
	qnaReturns: common.IQnaReturn[];
	clickThumb: (idx: number, script: common.IScript) => void;
	clickText?: (idx: number, script: common.IScript) => void;
	qnaReturnsClick?: (idx: number) => void;
	view: boolean;
	roll: ''|'A'|'B';
	shadowing: boolean;
	noSwiping: boolean;
	compDiv: 'COMPREHENSION'|'DIALOGUE';
	viewClue: boolean;
	viewScript: boolean;
	viewTrans: boolean;
	numRender?: number;
}

@observer
class ScriptContainer extends React.Component<IScriptContainer> {
	private m_soption: SwiperOptions = {
		direction: 'vertical',
		observer: true,
		slidesPerView: 'auto',
		freeMode: true,
		mousewheel: true,			
		noSwiping: false,
		followFinger: true,
		noSwipingClass: 'swiper-no-swiping',
		scrollbar: {el: '.swiper-scrollbar',
		draggable: true, 
		hide: false},		
	};
	private m_swiper!: Swiper;

	private _refSwiper = (el: SwiperComponent) => {
		if(this.m_swiper || !el) return;
		this.m_swiper = el.swiper;

	}
	public scrollTo(fidx: number, dur?: number) {
		fidx = fidx - 1;
		if(fidx < 0) fidx = 0;
		this.m_swiper.slideTo(fidx, dur);
	}
	public componentDidUpdate(prev: IScriptContainer) {
		// console.log(this.props.selected);
		const { focusIdx, view, compDiv, viewTrans, roll, shadowing, noSwiping } = this.props;

		if(!this.m_swiper) return;
		
		let bUpdate = false;
		
		if(prev.focusIdx !== focusIdx && focusIdx >= 0) {
			let fidx = this.props.focusIdx - 1;
			if(fidx < 0) fidx = 0;
			this.m_swiper.slideTo(fidx);
		}
		if(view !== prev.view) {
			bUpdate = true;
			this.m_swiper.slideTo(0, 0);
		}
		if(compDiv !== prev.compDiv) {
			bUpdate = true;
			this.m_swiper.slideTo(0, 0);
		}
		if(roll !== prev.roll && roll !== '') {
			bUpdate = true;
			this.m_swiper.slideTo(0);
		}
		if(shadowing && !prev.shadowing) {
			bUpdate = true;
			this.m_swiper.slideTo(0);
		}		
		if(noSwiping !== prev.noSwiping) {
			bUpdate = true;
			this.m_soption.noSwiping = this.props.noSwiping;
			this.m_swiper.params.noSwiping = this.props.noSwiping;
			this.m_soption.followFinger = !this.props.noSwiping;
			this.m_swiper.params.followFinger = !this.props.noSwiping;
			
			if(this.m_soption.scrollbar) this.m_soption.scrollbar.draggable = !noSwiping;
			if(this.m_swiper.params.scrollbar) this.m_swiper.params.scrollbar.draggable = !noSwiping;
			
			if(noSwiping) {
				this.m_soption.noSwipingClass = 'swiper-wrapper';
				this.m_swiper.params.noSwipingClass = 'swiper-wrapper';
			} else {
				this.m_soption.noSwipingClass = 'swiper-no-swiping';
				this.m_swiper.params.noSwipingClass = 'swiper-no-swiping';				
			}
		}
		let tidx = -1;
		if(viewTrans !== prev.viewTrans) {
			if(!noSwiping) tidx = this.m_swiper.activeIndex;
			bUpdate = true;
		}
		if(bUpdate && view) {
			this.m_swiper.update();
			if(this.m_swiper.scrollbar) this.m_swiper.scrollbar.updateSize();
			if(tidx >= 0) {
				this.m_swiper.slideTo(tidx, 0);
			}
		}
	}

	public render() {
		const { numRender } = this.props;
		return (
			<>
				<SwiperComponent {...this.m_soption} ref={this._refSwiper}/>
				<div style={{display: 'none'}}>{numRender}</div>
			</>
		);
	}
}

export default ScriptContainer;