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

interface IQuizBoxProps {
	view: boolean;
	result : string[][];
	answer : boolean;
	onClosed: () => void;
	tab :'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT';
	idx : number;
}
@observer
class ResultScreenPopup extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _color : COLOR[] = [];
	@observable private _corfal : 0|1|2 = 0
	// @observable private _result : result
	
	private _swiper?: Swiper;

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;
		this._swiper = el.swiper;
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
		const { onClosed, result, idx } = this.props;		
	
		return (
			<>
			<CoverPopup className="submit_status_popup" view={this._view} onClosed={onClosed} >
				<div className="pop_bg">
					<ToggleBtn className="btn_popup_close" onClick={this._onClosePopup}/>
					<div className="popbox">
						<SwiperComponent ref={this._refSwiper}>			
							{result[idx]?.map((url , idx)=>{									
								return(
									<div key={idx}>
										<img className="thumnail" src={url}></img>												
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