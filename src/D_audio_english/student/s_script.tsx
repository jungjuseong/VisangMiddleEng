import * as React from 'react';
import { observer } from 'mobx-react';

import { action, observable } from 'mobx';
import * as kutil from '@common/util/kutil';

import { IStateCtx, IActionsCtx, SPROG } from './s_store';
import SendUINew from '../../share/sendui_new';
import ScriptContainer, { IScriptContainerProps } from '../script_container';
import { IQNAMsg,IScript } from '../common';
import { App } from '../../App';
import * as felsocket from '../../felsocket';

interface ISScriptProps {
	view: boolean;
	scriptProg: SPROG[];
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

		if(this.props.scriptProg[this.props.state.idx] !== SPROG.SELECTING) return; 

		const selectedIndex = this._selected.indexOf(idx);
		if(selectedIndex < 0) this._selected.push(idx);
		else this._selected.splice(selectedIndex, 1);
	}

	private _onSend = async () => {
		const { actions,state } = this.props;
		if(!App.student || state.scriptProg[state.idx] !== SPROG.SELECTING) return; 

		App.pub_playToPad();
		const qnaMessage: IQNAMsg = {
			msgtype: 'qna_return',
			idx: state.idx,
			id: App.student.id,
			returns: this._selected.slice(0), 
			stime: this._stime,
            etime: Date.now(),
		};
		felsocket.sendTeacher($SocketType.MSGTOTEACHER, qnaMessage);
		state.scriptProg[state.idx] = SPROG.SENDING;
		await kutil.wait(600);

		if(state.scriptProg[state.idx] === SPROG.SENDING) {
			state.scriptProg[state.idx] = SPROG.SENDED;
			App.pub_playGoodjob();
			actions.startGoodJob(); // 추가
		}
	}

	public componentWillReceiveProps(next: ISScriptProps) {
		if(next.scriptProg[this.props.state.idx] < SPROG.SELECTING) {
			while(this._selected.length > 0) this._selected.pop();
			this._stime = 0;
		}		
	}

	public render() {
		const { view,scriptProg, actions, state} = this.props;
		const scripts = actions.getData().scripts
		const ContainerProps: IScriptContainerProps = {
			view: false,
			role: actions.getData().role_play,
			script: [],
			idx: 0,
			focusIdx: state.focusIdx,
			selected: this._selected,
			qnaReturns: [],
			roll: state.roll,
			shadowing: state.shadowing,
			noSwiping: state.isPlay,
			viewClue: state.viewClue,
			viewScript: true,
			viewTrans: false,
			clickThumb: this._onTextClick,
			clickText: this._onTextClick
		}
		return (
			<>
			{scripts.map((script,idx) => {
				const props: IScriptContainerProps = {
					view: (state.viewDiv === 'content'&& state.scriptProg[idx] > SPROG.UNMOUNT),
					role: actions.getData().role_play,
					script,
					idx,
					focusIdx: state.focusIdx,
					selected: this._selected,
					qnaReturns: [],
					roll: state.roll,
					shadowing: state.shadowing,
					noSwiping: state.isPlay,
					viewClue: state.viewClue,
					viewScript: true,
					viewTrans: false,
					clickThumb: this._onTextClick,
					clickText: this._onTextClick,
				};
				return (
				<div className={'s_script '+ (state.scriptProg[idx] > SPROG.UNMOUNT ? '' : 'hide')}>
					<div className="script_container">
						<ScriptContainer {...props}/>
					</div>
					<SendUINew
						view={view && (scriptProg[idx] === SPROG.SELECTING || scriptProg[idx] === SPROG.SENDING) && this._selected.length > 0}
						type={'pad'}
						sended={false}
						originY={0}
						onSend={this._onSend}
					/>
				</div>)
			})}
			</>
		);
	}
}

export default SScript;


