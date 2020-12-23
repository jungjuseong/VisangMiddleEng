import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { QnaProg } from '../s_store';
import { IScript } from '../../common';


import * as style from '../../../share/style';
import * as _ from 'lodash';

interface ISScriptProps {
	idx: number;
	script: IScript;
	viewTrans: boolean;
	focusSeq: number;
	viewSctiprFocusBG: boolean;
	selected: boolean;
	qnaProg: QnaProg;
	onClick: (script: IScript, idx: number) => void;
}

class SScript extends React.Component<ISScriptProps> {

	private _downIdx = -1;
	private _downX = Number.MIN_VALUE;
	private _downY = Number.MIN_VALUE;

	private _resetDownPoint() {
		this._downIdx = -1;
		this._downX = Number.MIN_VALUE;
		this._downY = Number.MIN_VALUE;
	}

	private _onTextDown = (ev: React.MouseEvent<HTMLElement>) => {
		const { qnaProg,script } = this.props;

		if(qnaProg === QnaProg.SELECTING) {
			this._downIdx = script.seq;
			this._downX = ev.clientX;
			this._downY = ev.clientY;
		}
	}

	private _onTextUp = (ev: React.MouseEvent<HTMLElement>) => {
		const { qnaProg,script,idx,onClick } = this.props;

		if(qnaProg !== QnaProg.SELECTING) this._resetDownPoint();
		else {
			const isClick = (this._downIdx === script.seq) && Math.abs(this._downX - ev.clientX) < 30 && Math.abs(this._downY - ev.clientY) < 30;

			this._resetDownPoint();
			if(isClick) onClick(script, idx);		
		}
	}

	private _onTextCancel = (ev: React.MouseEvent<HTMLElement>) => {
		this._resetDownPoint();
	}

	public render() {
		const {script, viewTrans, focusSeq, viewSctiprFocusBG, selected } = this.props;
		const class_names = ['eng'];

		if(focusSeq === script.seq) {
			if(viewSctiprFocusBG) class_names.push('bg-on');
			class_names.push('on');
		}
		if(selected) class_names.push('selected');
		if(viewTrans) class_names.push('view-trans');

		return (
			<>
			<div 
				className={class_names.join(' ')} 
				onPointerDown={this._onTextDown} 
				onPointerUp={this._onTextUp}
				onPointerCancel={this._onTextCancel}
				onPointerLeave={this._onTextCancel}			
			>
				<span dangerouslySetInnerHTML={{__html: script.dms_passage}}/>
			</div>
			<div className="trans" style={viewTrans ? undefined : style.NONE}>{script.dms_kor.ko}</div>
			</>
		);
	}
}
export default SScript;


