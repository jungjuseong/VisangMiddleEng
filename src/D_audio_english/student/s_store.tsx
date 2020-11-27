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
	idx: number;
	scriptProg: SPROG;
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
		this.state.idx = -1;
		this.state.scriptProg = SPROG.UNMOUNT;
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
			const msg = data.data as  common.IIndexMsg;
			if(msg.msgtype === 'confirm_send') {
				if(msg.idx === 0){
					if(this.state.confirmProg > QPROG.UNINIT) return;
					this.state.scriptProg = SPROG.UNMOUNT;
					this.state.questionView = true;
					this.state.confirmProg = QPROG.ON;
					this.state.idx = 0;
					this.state.viewDiv = 'content';
					this.state.qsMode  = 'question';
					this.state.roll = '';
					this.state.shadowing = false;
				}else if(msg.idx === 1){
					if(this.state.confirmProg > QPROG.UNINIT) return;
					this.state.scriptProg = SPROG.UNMOUNT;
					this.state.questionView = true;
					this.state.confirmProg = QPROG.ON;
					this.state.idx = 1;
					this.state.viewDiv = 'content';
					this.state.qsMode  = 'question';
					this.state.roll = '';
					this.state.shadowing = false;
				}else{
					if(this.state.confirmProg > QPROG.UNINIT) return;
					this.state.scriptProg = SPROG.UNMOUNT;
					this.state.questionView = true;
					this.state.confirmProg = QPROG.ON;
					this.state.idx = 2;
					this.state.viewDiv = 'content';
					this.state.qsMode  = 'question';
					this.state.roll = '';
					this.state.shadowing = false;
				}
			} else if(msg.msgtype === 'confirm_end') {
				const qProg = this.state.confirmProg;
				if(this.state.viewDiv !== 'content') return;
				else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;
				this.state.confirmProg = QPROG.READYA;
			} else if(msg.msgtype === 'script_send') {
				if(this.state.scriptProg !== SPROG.UNMOUNT) return;

				if(this.state.confirmProg < QPROG.COMPLETE) this.state.confirmProg = QPROG.READYA;
				this.state.questionView = true;

				this.state.scriptProg = SPROG.MOUNTED;
				this.state.viewDiv = 'content';
				this.state.qsMode  = 'script';
				this.state.roll = '';
				this.state.shadowing = false;
			}else if(msg.msgtype === 'shadowing_send') {
				if(this.state.viewDiv !== 'content') return;
				else if(this.state.qsMode !== 'script') return;	
				this.state.roll = '';
				this.state.shadowing = true;
				this.state.focusIdx = -1;
			} else if(msg.msgtype === 'playing' || msg.msgtype === 'paused') {
				if(this.state.viewDiv !== 'content') return;
				this.state.isPlay = (msg.msgtype === 'playing');
			} else if(msg.msgtype === 'focusidx') {
				if(this.state.viewDiv !== 'content') return;
				const fmsg = msg as common.IFocusMsg;
				this.state.focusIdx = fmsg.fidx;
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
		const scripts = this._data.script;
		const speakerA = this._data.role_play.speakerA.name;
		const speakerB = this._data.role_play.speakerB.name;
		const speakerC = this._data.role_play.speakerC.name;

		if(!this._data.role_play.speakerD) {
			this._data.role_play.speakerD = {
				name: '',
				image_s: '',
				image_l: '',
			};
		}
		if(!this._data.role_play.speakerE) {
			this._data.role_play.speakerE = {
				name: '',
				image_s: '',
				image_l: '',
			};
		}
		const speakerD = this._data.role_play.speakerD.name;
		const speakerE = this._data.role_play.speakerE.name;

		for(let i = 0; i < scripts.length; i++) {
			const script = scripts[i];
			
			if(script.speaker === speakerA) script.roll = 'A';
			else if (script.speaker === speakerB) script.roll = 'B';
			else if (script.speaker === speakerC) script.roll = 'C';
			else if (script.speaker === speakerD) script.roll = 'D';
			else script.roll = 'E';
		}
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