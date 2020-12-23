import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { App } from '../../../App';
import { ToggleBtn } from '@common/component/button';
import { IScript } from '../../common';
import { observable } from 'mobx';
import { CoverPopup } from '../../../share/CoverPopup';

const SwiperComponent = require('react-id-swiper').default;

interface ITranslationProps {
	view: boolean;
	scripts: IScript[];
	onClosed: () => void;
}

@observer
class TransPopup extends React.Component<ITranslationProps> {
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

	public componentDidUpdate(prev: ITranslationProps) {
		const { view } = this.props;

		if (view !== prev.view) {
			this.m_view = view;
			if (view) {
				if(this._swiper) this._swiper.slideTo(0, 0);
				
				_.delay(() => {
					if(this._swiper) {
						this._swiper.update();
						if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
						this._swiper.slideTo(0, 0);
					}
				}, 500);
			}
		}
	}

	public render() {
		const { view, scripts, onClosed } = this.props;

		return (
			<CoverPopup className="trans_popup" view={view && this.m_view} onClosed={onClosed} >
				<span className="title">해석</span>
				<ToggleBtn className="btn_close" onClick={this._onClose} />
				<div className="trans_script">
					<SwiperComponent ref={this._refSwiper} direction="vertical" scrollbar={{ el: '.swiper-scrollbar', draggable: true,}}
						observer={true} slidesPerView="auto" freeMode={true}>
						{scripts.map((script, idx) => 							
							<div key={idx} className="script_eng">
								{script.dms_eng}
								<div>{script.dms_kor.ko}</div>
							</div>
						)}
					</SwiperComponent>
				</div>
			</CoverPopup>
		);
	}
}

export default TransPopup;