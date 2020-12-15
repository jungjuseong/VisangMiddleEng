import * as React from 'react';
import * as _ from 'lodash';

import { observer } from 'mobx-react';
import { observable, } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { IScript } from '../../common';

@observer
export class CaptionBox extends React.Component<{view: boolean, script?: IScript}> {
	@observable private _viewEng = true;
	@observable private _viewTrans = true;

	private _toggleEng = () => {
		this._viewEng = !this._viewEng;
	}

	public render() {
		const { view, script } = this.props;
		let eng: string|JSX.Element = <>&nbsp;</>;
		let trans: string|JSX.Element = <>&nbsp;</>;
		
		if(script) {
			if(this._viewEng) eng = script.dms_eng;
			if(this._viewTrans) trans = script.dms_kor;
		} 
		return (
			<div className="caption_box" style={{display: view ? '' : 'none'}}>
				<div className="caption_eng">
					<span>{eng}</span>
					<ToggleBtn className="btn_eng" on={this._viewEng} onClick={this._toggleEng}/>
				</div>
			</div>
		);
	}
}

export default CaptionBox;