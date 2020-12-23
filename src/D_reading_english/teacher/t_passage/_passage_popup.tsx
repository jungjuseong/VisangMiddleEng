import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { App } from '../../../App';
import { ToggleBtn } from '@common/component/button';

import { observable } from 'mobx';
import { CoverPopup } from '../../../share/CoverPopup';
import SendUI from '../../../share/sendui_new';

type _PopupType = 'off'|'READALOUD'|'SHADOWING'|'QNA';
interface IPopupItem {
	type: _PopupType;
	view: boolean;
	onClosed: () => void;
	onSend: () => void;
}

@observer
class PassagePopup extends React.Component<IPopupItem> {
	@observable private m_view = false;

	private _onClose = () => {
		App.pub_playBtnTab();
		this.m_view = false;
	}
	public componentDidUpdate(prev: IPopupItem) {
		const { view } = this.props;
  		if (view && !prev.view || !view && prev.view) this.m_view = view;
	}

	public render() {
		const { type, view,onClosed,onSend } = this.props;

		let title = type as string;
		if(type === 'READALOUD') title = 'READ ALONG';
		else if(type === 'SHADOWING') title = 'LISTEN & REPEAT';
		else if(type === 'QNA') title = 'Q & A';
		
		return (
			<CoverPopup className={'passage_popup ' + type} view={view && this.m_view} onClosed={onClosed} >
				<span>{title}</span><ToggleBtn className="btn_close" onClick={this._onClose} />
				<div className="popup_content">
					<span>Read along together.</span>
					<span>Listen and repeat.</span>
					<span>Do you have any questions?</span>
				</div>
				<SendUI view={view} type={'teacher'} sended={false} originY={0} onSend={onSend} />
			</CoverPopup>
		);
	}
}

export default PassagePopup;