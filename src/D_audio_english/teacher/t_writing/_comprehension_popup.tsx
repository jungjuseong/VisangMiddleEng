import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import * as kutil from '@common/util/kutil';

import { App } from '../../../App';
import SendUINew from '../../../share/sendui_new';
import { CoverPopup } from '../../../share/CoverPopup';
import ImageBox from './_image_box';

/* 팝업 Page */
interface IComprehensionPopupProps {
	type: 'off'|'Q&A' |'ROLE PLAY'|'SHADOWING';	// 19-02-01 190108_검수사항 p.13 수정 
	view: boolean;
	imgA: string;
	imgB: string;
	onSend: (roll: ''|'A'|'B') => void;
	onClosed: () => void;
}

@observer
class ComprehensionPopup extends React.Component<IComprehensionPopupProps> {
	@observable private m_view = false;
	@observable private m_sendView = false;
	@observable private m_roll: ''|'A'|'B' = '';

	private onSend = async () => {
		console.log('roll1',this.m_roll)
		this.props.onSend(this.m_roll);
		await kutil.wait(400);
		this.m_view = false;
	}

	private _onClose = () => {
		this.m_view = false;
	}

	private _onRollA = () => {
		if(this.props.type === 'ROLE PLAY') {
			App.pub_playBtnTab();
			this.m_roll = 'A';
			this.m_sendView = true;
		}
	}

	private _onRollB = () => {
		if(this.props.type === 'ROLE PLAY') {			
			App.pub_playBtnTab();
			this.m_roll = 'B';
			this.m_sendView = true;
		}
	}

	public componentDidUpdate(prev: IComprehensionPopupProps) {
		const { type,view } = this.props;

		if (view && !prev.view) {
			this.m_view = true;
			this.m_sendView = (type !== 'ROLE PLAY') ;
			this.m_roll = '';
		} 
		else if (!view && prev.view) {
			this.m_view = false;
			this.m_sendView = false;
			this.m_roll = '';
		}
	}

	public render() {
		const { view, type, onClosed, imgA, imgB } = this.props;
		console.log('roll2',this.m_roll)
		return (
			<CoverPopup className={'compre_popup ' + type} view={view && this.m_view} onClosed={onClosed} >
				<span>{type === 'SHADOWING' ? 'LISTEN & REPEAT' : type}</span>
				<ToggleBtn className="btn_close" onClick={this._onClose} />
				<div className="popup_content">
					<span>Do you have any questions?</span>
					<span>Choose the role.</span>
					<span>Listen and repeat.</span>
					<ImageBox role={this.m_roll} images={[App.data_url + imgA, App.data_url + imgB]} onRoleA={this._onRollA} onRoleB={this._onRollB}/>
				</div>
				<SendUINew view={this.m_sendView} preventUpWhenView={true} type={'teacher'} sended={false} originY={0} onSend={this.onSend}/>
			</CoverPopup>
		);
	} 
}

export default ComprehensionPopup;