import * as React from 'react';

import { observer } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';

import { App } from '../../App';
import { ToggleBtn } from '@common/component/button';
import * as kutil from '@common/util/kutil';

import { IStateCtx, IActionsCtx, QPROG, SPROG } from './s_store';
import * as felsocket from '../../felsocket';

import SQuestion from './s_question';
import SScript from './s_script';

interface ISContentProps {
	view: boolean;
	questionView: boolean;
	questionProg: QPROG;
	scriptProg: SPROG;
	scriptMode: 'COMPREHENSION'|'DIALOGUE';
	qsMode: ''|'question'|'script';
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class SContent extends React.Component<ISContentProps> {
	@observable private _img_pop_on = false;

	private _stime = 0;
	
	private _clickYes = () => {
		const { scriptMode, scriptProg } = this.props.state;
		if(this._stime === 0) this._stime = Date.now();

		if(scriptProg !== SPROG.YESORNO || scriptMode !== 'COMPREHENSION') return;

		App.pub_playBtnTab();
		this.state = {
			...this.state,
			qsMode: 'script',
			scriptProg: SPROG.SELECTING,
		};

		this._img_pop_on = true;
		_.delay(() => {
			this._img_pop_on = false;
		}, 2000); // 시간수정
	}
	
	private _clickNo = async () => {
		const { state,actions } = this.props;
		if(this._stime === 0) this._stime = Date.now();

		if(state.scriptProg !== SPROG.YESORNO || state.scriptMode !== 'COMPREHENSION') return;

		App.pub_playBtnTab();
		state.scriptProg = SPROG.SENDED;
		if(!App.student) return;

		felsocket.sendTeacher($SocketType.MSGTOTEACHER, {
			msgtype: 'qna_return',
			id: App.student.id,
			returns: [],
			stime: this._stime,
            etime: Date.now(),
		});

		await kutil.wait(300);
		App.pub_playGoodjob();
		actions.startGoodJob(); // 추가
	}

	public render() {
		const {view, state, actions, questionView, questionProg, scriptProg, scriptMode, qsMode} = this.props;
		const style: React.CSSProperties = (view) ? {} : {
			opacity: 0,
			zIndex: -1,
			pointerEvents: 'none',
		};

		const scriptModeProps = {
			questionView, questionProg, scriptProg,	scriptMode,	qsMode,	state,	actions
		};
		return (
			<div className="s_content" style={style}>
				<SScript view={view && scriptProg > SPROG.UNMOUNT} {...scriptModeProps}/>
				<SQuestion view={view && questionView} {...scriptModeProps} />

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