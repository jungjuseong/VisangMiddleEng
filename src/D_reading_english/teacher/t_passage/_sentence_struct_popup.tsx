import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { App } from '../../../App';
import { ToggleBtn } from '@common/component/button';
import * as common from '../../common';
import { observable } from 'mobx';
import { CoverPopup } from '../../../share/CoverPopup';

const SwiperComponent = require('react-id-swiper').default;

interface IStructure {
	view: boolean;
	data : common.IPassage[]
	onClosed: () => void;
}

@observer
class SentenceStructurePopup extends React.Component<IStructure> {
	@observable private m_view = false;
	@observable private _swiper: Swiper|null = null;

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;
		this._swiper = el.swiper;
	}
	private _onClose = () => {
		App.pub_playBtnTab();
		this.m_view = false;
	}
	public componentDidUpdate(prev: IStructure) {
		if (this.props.view && !prev.view) {
			this.m_view = true;
			if(this._swiper) {
				this._swiper.slideTo(0, 0);
			}
			_.delay(() => {
				if(this._swiper) {
					this._swiper.update();
					if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
					this._swiper.slideTo(0, 0);
				}
			}, 500);
		} else if (!this.props.view && prev.view) {
			this.m_view = false;
		}
	}
	public render() {
		const { view, data } = this.props;
		// 클래스 이름 변경 필요(*)
		return (
			<CoverPopup className="trans_popup" view={this.props.view && this.m_view} onClosed={this.props.onClosed} >
				<span className="title">문장 구조</span><ToggleBtn className="btn_close" onClick={this._onClose} />
				<div className="trans_script">
					<SwiperComponent
						ref={this._refSwiper}
						direction="vertical"
						scrollbar={{ el: '.swiper-scrollbar', draggable: true,}}
						observer={true}
						slidesPerView="auto"
						freeMode={true}						
					>
						<div className="img_wrap">
							<img src={App.data_url + data[0].structureimage}></img>
						</div>
					</SwiperComponent>
				</div>
			</CoverPopup>
		);
	}
}

export default SentenceStructurePopup;