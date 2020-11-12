import * as React from 'react';
import { observer } from 'mobx-react';

import * as common from '../common';
import ScriptBox from './_script_box';

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
		scrollbar: {el: '.swiper-scrollbar',draggable: true, hide: false},		
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
		if(!this.m_swiper) return;
		
		let bUpdate = false;
		
		if(prev.focusIdx !== this.props.focusIdx && this.props.focusIdx >= 0) {
			let fidx = this.props.focusIdx - 1;
			if(fidx < 0) fidx = 0;
			this.m_swiper.slideTo(fidx);
		}
		if(this.props.view !== prev.view) {
			bUpdate = true;
			this.m_swiper.slideTo(0, 0);
		}
		if(this.props.compDiv !== prev.compDiv) {
			bUpdate = true;
			this.m_swiper.slideTo(0, 0);
		}
		if(this.props.roll !== prev.roll && this.props.roll !== '') {
			bUpdate = true;
			this.m_swiper.slideTo(0);
		}
		if(this.props.shadowing && !prev.shadowing) {
			bUpdate = true;
			this.m_swiper.slideTo(0);
		}		
		if(this.props.noSwiping !== prev.noSwiping) {
			bUpdate = true;
			this.m_soption.noSwiping = this.props.noSwiping;
			this.m_swiper.params.noSwiping = this.props.noSwiping;
			this.m_soption.followFinger = !this.props.noSwiping;
			this.m_swiper.params.followFinger = !this.props.noSwiping;
			
			if(this.m_soption.scrollbar) this.m_soption.scrollbar.draggable = !this.props.noSwiping;
			if(this.m_swiper.params.scrollbar) this.m_swiper.params.scrollbar.draggable = !this.props.noSwiping;
			
			if(this.props.noSwiping) {
				this.m_soption.noSwipingClass = 'swiper-wrapper';
				this.m_swiper.params.noSwipingClass = 'swiper-wrapper';
			} else {
				this.m_soption.noSwipingClass = 'swiper-no-swiping';
				this.m_swiper.params.noSwipingClass = 'swiper-no-swiping';				
			}
		}
		let tidx = -1;
		if(this.props.viewTrans !== prev.viewTrans) {
			if(!this.props.noSwiping) tidx = this.m_swiper.activeIndex;
			bUpdate = true;
		}
		if(bUpdate && this.props.view) {
			this.m_swiper.update();
			if(this.m_swiper.scrollbar) this.m_swiper.scrollbar.updateSize();
			if(tidx >= 0) {
				this.m_swiper.slideTo(tidx, 0);
			}
		}
	}
	public render() {
		const { data, selected, qnaReturns } = this.props;

		const arr: string[] = ['script_box'];

		if(b_ls_writing_s) {
			arr.push('student');
			arr.push('DIALOGUE');
		} else {
			arr.push(this.props.compDiv);
		}
		
		const boxClass = arr.join(' ');
		return (
			<>
			<SwiperComponent {...this.m_soption} ref={this._refSwiper}>
			</SwiperComponent>
			<div style={{display: 'none'}}>{this.props.numRender}</div>
			</>
		);
	}
}

export default ScriptContainer;