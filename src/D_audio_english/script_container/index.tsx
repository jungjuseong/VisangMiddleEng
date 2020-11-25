import * as React from 'react';
import { observer } from 'mobx-react';

import * as common from '../common';
import ScriptBox from './_script_box';
import { App } from '../../App';
import { BtnAudio } from '../../share/BtnAudio';

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
		const thumbA = data.role_play.speakerA.image_s;
		const thumbB = data.role_play.speakerB.image_s;
		const thumbC = data.role_play.speakerC.image_s;
		const thumbD = data.role_play.speakerD.image_s;
		const thumbE = data.role_play.speakerE.image_s;

		const arr: string[] = ['script_box'];
		
		const boxClass = arr.join(' ');
		return (
			<>
			<BtnAudio className={'btn_audio'} url={App.data_url + "direction_001.mp3"}/>	
			<SwiperComponent {...this.m_soption} ref={this._refSwiper}>
				{data.script.map((script, idx) => {
					let thumb;
					if (script.roll === 'E')  thumb = thumbE;
					else if (script.roll === 'D')  thumb = thumbD;
					else if (script.roll === 'C')  thumb = thumbC;
					else if (script.roll === 'B')  thumb = thumbB;
					else thumb = thumbA;
					const sidx = selected.indexOf(idx); 

					let numOfReturn = (idx < qnaReturns.length) ? qnaReturns[idx].num : 0;

					return (
						<div className={boxClass} key={'script_' + idx}>
							<ScriptBox  
								view={this.props.view}
								script={script} 
								image_s={thumb} 
								idx={idx}
								focus={idx === this.props.focusIdx}
								selected={sidx >= 0}
								numOfReturn={numOfReturn}
								roll={script.roll}
								sroll={this.props.roll}
								shadowing={this.props.shadowing}
								clickThumb={this.props.clickThumb}
								clickText={this.props.clickText}
								qnaReturnsClick={this.props.qnaReturnsClick}
								compDiv={"DIALOGUE"}
								viewClue={this.props.viewClue}
								viewScript={this.props.viewScript}
								viewTrans={this.props.viewTrans}								
							/>
						</div>
					);
				})}
			</SwiperComponent>
			<div style={{display: 'none'}}>{this.props.numRender}</div>
			</>
		);
	}
}

export default ScriptContainer;