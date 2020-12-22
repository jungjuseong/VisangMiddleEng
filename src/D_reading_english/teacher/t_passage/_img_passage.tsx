import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { App } from '../../../App';
import { ToggleBtn } from '@common/component/button';

import * as common from '../../common';
import { observable, action } from 'mobx';
import { CoverPopup } from '../../../share/CoverPopup';

interface IImgPassage { 
	view: boolean;
	passage: common.IPassage;
	onClosed: () => void;
}
@observer
class ImgPassage extends React.Component<IImgPassage> {
	@observable private m_view = false;

	@action private _onClose = () => {
		App.pub_playBtnTab();
		this.m_view = false;
	}

	public componentDidUpdate(prev: IImgPassage) {
		const { view } = this.props;
		if(view && !prev.view || !view && prev.view) this.m_view = view;
	}

	public render() {
		const { passage } = this.props;
		return (
			<CoverPopup className="img_passage" view={this.m_view} onClosed={this.props.onClosed}>
				<img src={App.data_url + passage.image} draggable={false} />
				<ToggleBtn className="btn_close" onClick={this._onClose} />
			</CoverPopup>
		);
	}
}

export default ImgPassage;