import * as React from 'react';
import { observer } from 'mobx-react';

import { observable } from 'mobx';
import { ToggleBtn } from '@common/component/button';
import * as kutil from '@common/util/kutil';

import { IStateCtx, IActionsCtx, QPROG, SPROG } from './s_store';
import SendUINew from '../../share/sendui_new';
import ScriptContainer from '../script_container';
import { IQNAMsg,IScript } from '../common';
import { App } from '../../App';

import * as felsocket from '../../felsocket';

interface ISScriptProps {
	view: boolean;
	scriptProg: SPROG;
	qsMode: ''|'question'|'script';

	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class SScript extends React.Component<ISScriptProps> {
	@observable private _selected: number[] = [];

	private _stime = 0;
	
	private _onTextClick = (idx: number, script: IScript) => {
		if(this._stime === 0) this._stime = Date.now();

		if(this.props.scriptProg !== SPROG.SELECTING) return; 

		const selectedIndex = this._selected.indexOf(idx);
		if(selectedIndex < 0) this._selected.push(idx);
		else this._selected.splice(selectedIndex, 1);
	}

	private _onSend = async () => {
		const { actions,state } = this.props;
		if(!App.student || state.scriptProg !== SPROG.SELECTING) return; 

		App.pub_playToPad();
		// const qnaMessage: IQNAMsg = {
		// 	msgtype: 'qna_return',
		// 	id: App.student.id,
		// 	returns: this._selected.slice(0), 
		// 	stime: this._stime,
        //     etime: Date.now(),
		// };
		// felsocket.sendTeacher($SocketType.MSGTOTEACHER, qnaMessage);
		state.scriptProg = SPROG.SENDING;
		await kutil.wait(600);

		if(state.scriptProg === SPROG.SENDING) {
			state.scriptProg = SPROG.SENDED;
			// console.log('startGoodJob');
			App.pub_playGoodjob();
			actions.startGoodJob(); // 추가
		}
	}

	private _gotoQuestion = () => {
		const { state } = this.props;
		if(state.qsMode === 'question') return;
		// if(state.qsMode === 'question') return;
		App.pub_playBtnTab();
		state.qsMode = 'question';		
	}

	public componentWillReceiveProps(next: ISScriptProps) {
		if(next.scriptProg !== this.props.scriptProg) {
			if(next.scriptProg < SPROG.SELECTING) {
				while(this._selected.length > 0) this._selected.pop();
				this._stime = 0;
			}
		}
	}

	public render() {
		const { view,scriptProg, actions , state} = this.props;
		return (
			<div className={'s_script '}>
				<div className="script_container">
					<ScriptContainer
						view={state.viewDiv === 'content'}
						role = {actions.getData().role_play}
						script={actions.getData().scripts[0]}
						idx={state.idx}
						focusIdx={state.focusIdx}
						selected={this._selected}
						qnaReturns={[]}
						roll={state.roll}
						shadowing={state.shadowing}
						noSwiping={state.isPlay}
						viewClue={state.viewClue}
						viewScript={true}
						viewTrans={false}
						clickThumb={this._onTextClick}
						clickText={this._onTextClick}
					/>
				</div>
				<SendUINew
					view={view && (scriptProg === SPROG.SELECTING || scriptProg === SPROG.SENDING) && this._selected.length > 0}
					type={'pad'}
					sended={false}
					originY={0}
					onSend={this._onSend}
				/>
			</div>
		);
	}
}

export default SScript;


