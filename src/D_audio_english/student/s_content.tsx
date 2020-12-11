import * as React from 'react';

import { observer } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';

import { App } from '../../App';
import { ToggleBtn } from '@common/component/button';
import * as kutil from '@common/util/kutil';

import { IStateCtx, IActionsCtx, QPROG, SPROG } from './s_store';

import SConfirm from './s_confirm';
import SScript from './s_script';
import SAdditional from './s_additional';
import SDictation from './s_dictation';

interface ISContentProps {
	view: boolean;
	scriptProg: SPROG;
	qsMode: ''|'question'|'script';
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class SContent extends React.Component<ISContentProps> {
	@observable private _img_pop_on = false;

	private _stime = 0;
	
	private _clickYes = () => {
		if(this._stime === 0) this._stime = Date.now();

		const {state} = this.props;
		if(state.scriptProg !== SPROG.YESORNO) return;
		

		App.pub_playBtnTab();
		state.qsMode = 'script';
		state.scriptProg = SPROG.SELECTING;

		this._img_pop_on = true;
		_.delay(() => {
			this._img_pop_on = false;
		}, 2000); // 시간수정
	}

	private _clickNo = async () => {
		const { state} = this.props;

		if(this._stime === 0) this._stime = Date.now();

		if(state.scriptProg !== SPROG.YESORNO) return;
		App.pub_playBtnTab();
		state.scriptProg = SPROG.SENDED;
		if(!App.student) return;
		// const msg: IQNAMsg = {
		// 	msgtype: 'qna_return',
		// 	id: App.student.id,
		// 	returns: [],
		// 	stime: this._stime,
        //     etime: Date.now(),
		// };

		// felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
		// console.log('startGoodJob');

		await kutil.wait(300);
		App.pub_playGoodjob();
		this.props.actions.startGoodJob(); // 추가
	}
	public componentWillUpdate(next: ISContentProps) {
		//
	}

	public render() {
		const {view, state, actions, scriptProg, qsMode} = this.props;
		const { confirmView,additionalView,dictationView } = state;
		let style: React.CSSProperties = {};
		if(!view) {
			style = {
				...style,
				opacity: 0,
				zIndex: -1,
				pointerEvents: 'none'
			};	
		}
		return (
			<div className="s_content" style={style}>
				<SScript view={view && scriptProg > SPROG.UNMOUNT} scriptProg={scriptProg} qsMode={qsMode} state={state} actions={actions}/>
				<SConfirm view={view && confirmView} questionView={confirmView}	scriptProg={scriptProg}	qsMode={qsMode}	state={state} actions={actions}/>
				<SAdditional view={view && additionalView} questionView={additionalView} scriptProg={scriptProg} qsMode={qsMode} state={state} actions={actions}/>
				<SDictation	view={view && dictationView} questionView={dictationView} scriptProg={scriptProg} qsMode={qsMode} state={state}	actions={actions}/>

				<div className={'img_pop' + (this._img_pop_on ? ' on' : '')} />
				<div className={'btn_box' + (scriptProg === SPROG.YESORNO ? ' on' : '')}>
					<ToggleBtn className="btn_yes" onClick={this._clickYes} on={scriptProg === SPROG.SELECTING}/>
					<ToggleBtn className="btn_no" onClick={this._clickNo} on={scriptProg === SPROG.SENDED}/>
				</div>
			</div>
		);
	}
}

export default SContent;