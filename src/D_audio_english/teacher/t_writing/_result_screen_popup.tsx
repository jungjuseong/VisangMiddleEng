import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../App';
import { CoverPopup } from '../../../share/CoverPopup';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';

export type COLOR = 'pink'|'green'|'orange'|'purple';
const SwiperComponent = require('react-id-swiper').default;

class NItem extends React.Component<{idx: number, on: boolean, onClick: (idx: number) => void}> {
	private _click = () => {
		this.props.onClick(this.props.idx);
	}
	public render() {
		const {idx, on} = this.props;
		return <span className={on ? 'on' : ''} onClick={this._click}></span>;
	}
}

interface IQuizBoxProps {
	view: boolean;
	result : string[][];
	onClosed: () => void;
	idx : number;
	color : COLOR;
	thumb : string;
	nickname : string;
}
@observer
class ResultScreenPopup extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _curIdx = 0;
	@observable private _color : COLOR[] = [];
	@observable private _corfal : 0|1|2 = 0
	// @observable private _result : result
	
	private _swiper?: Swiper;

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;
		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			this._curIdx = -1;
		});
		swiper.on('transitionEnd', () => {
			if(this.props.view) {
				this._curIdx = swiper.activeIndex;
			}
		});
		this._swiper = swiper;
	}

	private _onPage = (idx: number) =>{
		App.pub_playBtnTab();
		if(this._swiper) this._swiper.slideTo(idx);
	}

	private _onClosePopup = () => {
		App.pub_playBtnTab();
		this._view = false;
	}
 	public componentDidUpdate(prev: IQuizBoxProps) {
		const { view } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._corfal = 0;

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
		const { onClosed, result, idx, color, thumb, nickname } = this.props;		
	
		return (
			<>
			<CoverPopup className="result_screen" view={this._view} onClosed={onClosed} >
				<div className="result_bg">
					<div className="status">
						<img className = {color} src={thumb}></img>
						<div>
							<p className="s_name">{nickname}</p>
							<div className="score">0</div>
						</div>
					</div>
					<div className={"btn_page_box"}>
					{result[idx]?.map((quiz, idxs) => {
						return <NItem key={idxs} on={idxs === this._curIdx} idx={idxs} onClick={this._onPage} />;
					})}
					</div>
					<ToggleBtn className="btn_popup_close" onClick={this._onClosePopup}/>
					<div className="result_box">
						<SwiperComponent ref={this._refSwiper}>			
							{result[idx]?.map((url , idx)=>{									
								return(
									<div key={idx}>
										<div className="image_box">
										<img className="thumbnail" src={url}></img>												
										</div>
									</div>
								);
							})}
						</SwiperComponent>
					</div>
				</div>
			</CoverPopup>
			</>
		);
	}
}
export default ResultScreenPopup;