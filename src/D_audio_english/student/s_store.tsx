import * as React from 'react';
import { observable, action } from 'mobx';

import * as _ from 'lodash';
import * as common from '../common';
import { StudentContextBase, IActionsBase, IStateBase, VIEWDIV } from '../../share/scontext';

const enum QPROG {
	UNINIT,
	READYA,
	ON,
	SENDING,
	SENDED,
	COMPLETE,
}
const enum SPROG {
	UNMOUNT,
	MOUNTED,
	YESORNO,
	SELECTING,
	SENDING,
	SENDED,
}

interface IStateCtx extends IStateBase {
	questionView: boolean;
	confirmProg: QPROG;
	scriptProg: SPROG;
	scriptMode: 'COMPREHENSION'|'DIALOGUE';
	roll: ''|'A'|'B';
	shadowing: boolean;
	qsMode: ''|'question'|'script';
	viewClue: boolean;
	isPlay: boolean;
	focusIdx: number;
}
interface IActionsCtx extends IActionsBase {
	getData: () => common.IData;
}

class StudentContext extends StudentContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;
	private _data!: common.IData;

	constructor() {
		super();

		this.state.questionView = false;
		this.state.confirmProg = QPROG.UNINIT;
		this.state.scriptProg = SPROG.UNMOUNT;
		this.state.scriptMode = 'COMPREHENSION';
		this.state.qsMode  = '';
		this.state.roll = '';
		this.state.viewClue = false;
		this.state.focusIdx = -1;
		this.state.isPlay = false;
		this.state.shadowing = false;
		this.actions.getData = () => this._data;
	}

	@action protected _setViewDiv(viewDiv: VIEWDIV) {
		const state = this.state;
		if(state.viewDiv !== viewDiv) {
			this.state.questionView = false;
			if(this.state.confirmProg < QPROG.COMPLETE) this.state.confirmProg = QPROG.UNINIT;
			
			this.state.scriptProg = SPROG.UNMOUNT;
			this.state.qsMode  = '';
			this.state.roll = '';
			this.state.viewClue = false;
			this.state.shadowing = false;
			this.state.isPlay = false;
			this.state.focusIdx = -1;
		}
		super._setViewDiv(viewDiv);
	}
	@action public receive(data: ISocketData) {
		super.receive(data);
		// console.log('receive', data);
		if(data.type === $SocketType.MSGTOPAD && data.data) {
			const msg = data.data as  common.IMsg;
			if(msg.msgtype === 'confirm_send') {
				// if(this.state.confirmProg > QPROG.UNINIT) return;
				this.state.scriptProg = SPROG.UNMOUNT;
				this.state.questionView = true;
				this.state.confirmProg = QPROG.ON;
				this.state.viewDiv = 'content';
				this.state.scriptMode  = 'COMPREHENSION';
				this.state.qsMode  = 'question';
				this.state.roll = '';
				this.state.shadowing = false;
			} else if(msg.msgtype === 'confirm_end') {
				const qProg = this.state.confirmProg;
				if(this.state.viewDiv !== 'content') return;
				else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;
				this.state.confirmProg = QPROG.COMPLETE;
			} else if(msg.msgtype === 'script_send') {
				if(this.state.scriptProg !== SPROG.UNMOUNT) return;

				if(this.state.confirmProg < QPROG.COMPLETE) this.state.confirmProg = QPROG.READYA;
				this.state.questionView = true;

				this.state.scriptProg = SPROG.MOUNTED;
				this.state.viewDiv = 'content';
				this.state.scriptMode  = 'COMPREHENSION';
				this.state.qsMode  = 'script';
				this.state.roll = '';
				this.state.shadowing = false;
			}
		}
	}
	public uploaded = (url: string) => {
		//
	}
	@action public notify = (type: string) => {
		//
	}
	@action public notifyRecorded = (url: string) => {
		//
	}

	public setData(data: any) {
		// console.log(data);
		this._data = common.initData(data);
	}
}

const sContext = new StudentContext();
const  { Provider: SProvider, Consumer: StudentConsumer } = React.createContext( sContext );
class StudentProvider extends React.Component<{}> {
	public render() {
		return (
			<SProvider value={sContext}>
				{this.props.children}
			</SProvider>
		);
	}
}

function useStudent(WrappedComponent: any) {
	return function UseAnother(props: any) {
		return (
			<StudentConsumer>{(store: StudentContext) => (
					<WrappedComponent
						{...store}
					/>
			)}</StudentConsumer>
		);
	};
}

export {
	sContext,
	StudentProvider,
	StudentConsumer,
	StudentContext,
	useStudent,
	IStateCtx,
	IActionsCtx,
	QPROG,
	SPROG,
};