import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { App } from '../../../App';
import * as felsocket from '../../../felsocket';
import { IScript,IQnaReturn } from '../../common';

interface IScriptItemProps {
	script: IScript;
	curSeq: number;
	retCnt: number;
	qnaRet: IQnaReturn;
	viewReturn: boolean;
	onChoose: (script: IScript) => void;
}

@observer
class ScriptItem extends React.Component<IScriptItemProps> {
	
	private _clickReturn = () => {
		const { viewReturn, qnaRet } = this.props;
		if(viewReturn) {
			App.pub_playBtnTab();
			felsocket.startStudentReportProcess($ReportType.JOIN, qnaRet.users);	
		}
	}
	private _onClick = (evt: React.MouseEvent) => {
		const { script,onChoose } = this.props;
		if(evt.target instanceof HTMLElement) {
			if((evt.target as HTMLElement).classList.contains('ret-num')) return; 
		}
		onChoose(script);
	}

    public render() {
		const { script, curSeq, qnaRet, retCnt, viewReturn } = this.props;
		const class_names: string[] = [
			'script_line', 
			(script.seq === curSeq) ? 'on' : ''
		];
		return (
			<span id={'script_' + script.seq} className={class_names.join(' ')} onClick={this._onClick}>
				<span onClick={this._clickReturn} className="ret-num" style={{display: viewReturn && qnaRet.num > 0 ? '' : 'none'}}>
					{qnaRet.num}
				</span>
				<span className="ret-cnt" style={{display: 'none'}}>{retCnt}</span>
				<span dangerouslySetInnerHTML={{__html: script.dms_passage}}/>
			</span>
		);
	}
}

export default ScriptItem;