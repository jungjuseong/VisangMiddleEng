import * as React from 'react';
import { observer } from 'mobx-react';

import { IScript,IRolePlay,IQnaReturn } from '../common';
import ScriptBox from './_script_box';

const SwiperComponent = require('react-id-swiper').default;

interface IScriptContainer {
	role: IRolePlay;
	script: IScript[];
	focusIdx: number;
	selected: number[];
	idx: number;
	qnaReturns: IQnaReturn[];
	clickThumb: (idx: number, script: IScript) => void;
	clickText?: (idx: number, script: IScript) => void;
	qnaReturnsClick?: (idx: number) => void;
	view: boolean;
	roll: ''|'A'|'B';
	shadowing: boolean;
	noSwiping: boolean;
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
		// fidx = fidx - 1;
		// if(fidx < 0) fidx = 0;
		this.m_swiper.slideTo((fidx - 1) < 0 ? 0 : fidx - 1, dur);
	}
	public componentDidUpdate(prev: IScriptContainer) {
		// console.log(this.props.selected);
		const { view, shadowing, noSwiping, focusIdx, viewTrans, roll } = this.props;

		if(!this.m_swiper) return;
		
		let bUpdate = false;
		
		if(prev.focusIdx !== focusIdx && focusIdx >= 0) {
			let fidx = focusIdx - 1;
			if(fidx < 0) fidx = 0;
			this.m_swiper.slideTo(fidx);
		}
		if(view !== prev.view) {
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
			this.m_soption.noSwiping = noSwiping;
			this.m_swiper.params.noSwiping = noSwiping;
			this.m_soption.followFinger = !noSwiping;
			this.m_swiper.params.followFinger = !noSwiping;
			
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
		if(bUpdate && this.props.view) {
			this.m_swiper.update();
			if(this.m_swiper.scrollbar) this.m_swiper.scrollbar.updateSize();
			if(tidx >= 0) {
				this.m_swiper.slideTo(tidx, 0);
			}
		}
	}
	public render() {
		const { view, script, role, selected, roll, numRender, shadowing, viewClue, viewScript, viewTrans, qnaReturns, focusIdx } = this.props;
		const thumbA = role.speakerA.image_s;
		const thumbB = role.speakerB.image_s;
		const thumbC = role.speakerC.image_s;
		const thumbD = role.speakerD.image_s;
		const thumbE = role.speakerE.image_s;

		const arr: string[] = ['script_box'];		
		const boxClass = arr.join(' ');
		return (
			<>
			<div className="swiper-container">
				{script.map((item, idx) => {
					let thumb;
					if (item.roll === 'E')  thumb = thumbE;
					else if (item.roll === 'D')  thumb = thumbD;
					else if (item.roll === 'C')  thumb = thumbC;
					else if (item.roll === 'B')  thumb = thumbB;
					else thumb = thumbA;
					const sidx = selected.indexOf(idx); 

					let numOfReturn = (idx < qnaReturns.length) ? qnaReturns[idx].num : 0;

					return (
						<div className={boxClass} key={'script_' + idx}>
							<ScriptBox  
								view={view}
								script={item} 
								image_s={thumb} 
								idx={idx}
								focus={idx === focusIdx}
								selected={sidx >= 0}
								numOfReturn={numOfReturn}
								roll={item.roll}
								sroll={roll}
								shadowing={shadowing}
								clickThumb={this.props.clickThumb}
								clickText={this.props.clickText}
								qnaReturnsClick={this.props.qnaReturnsClick}
								compDiv={'DIALOGUE'}
								viewClue={viewClue}
								viewScript={viewScript}
								viewTrans={viewTrans}								
							/>
						</div>
					);
				})}
			</div>
			<div style={{display: 'none'}}>{numRender}</div>
			</>
		);
	}
}

export default ScriptContainer;