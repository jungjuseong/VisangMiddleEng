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
	confirmView: boolean;
	confirmBasicProg: QPROG;
	confirmSupProg: QPROG;
	confirmHardProg: QPROG;
	additionalView: boolean;
	additionalBasicProg: QPROG;
	additionalSupProg: QPROG;
	additionalHardProg: QPROG;
	dictationView: boolean;
	dictationProg: QPROG[];
	idx: number;
	scriptProg: SPROG[];
	hint: boolean;
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

		this.state.confirmView = false;
		this.state.additionalView = false;
		this.state.dictationView = false;
		this.state.confirmBasicProg = QPROG.UNINIT;
		this.state.confirmSupProg = QPROG.UNINIT;
		this.state.confirmHardProg = QPROG.UNINIT;
		this.state.additionalBasicProg = QPROG.UNINIT;
		this.state.additionalSupProg = QPROG.UNINIT;
		this.state.additionalHardProg = QPROG.UNINIT;
		this.state.dictationProg = [QPROG.UNINIT,QPROG.UNINIT,QPROG.UNINIT];
		this.state.idx = -1;
		this.state.scriptProg = [SPROG.UNMOUNT,SPROG.UNMOUNT,SPROG.UNMOUNT];
		this.state.qsMode  = '';
		this.state.hint = false;
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
			this.state.confirmView = false;
			this.state.additionalView = false;
			this.state.dictationView = false;
			if(this.state.confirmSupProg < QPROG.COMPLETE) this.state.confirmSupProg = QPROG.UNINIT;
			
			this.state.scriptProg = [SPROG.UNMOUNT,SPROG.UNMOUNT,SPROG.UNMOUNT];
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
				if(msg.idx === 0) {
					if(this.state.confirmSupProg > QPROG.UNINIT) return;
					this.state.confirmSupProg = QPROG.ON;
					this.state.idx = 0;
				} else if(msg.idx === 1) {
					if(this.state.confirmBasicProg > QPROG.UNINIT) return;
					this.state.confirmBasicProg = QPROG.ON;
					this.state.idx = 1;
				} else {
					const hintmsg = msg as common.IConfirmHardMsg;
					if(this.state.confirmHardProg > QPROG.UNINIT) return;
					this.state.confirmHardProg = QPROG.ON;
					this.state.idx = 2;
					this.state.hint = hintmsg.hint;
					console.log('hardreturn' + this.state.hint);
				}
				this.state.scriptProg = [SPROG.UNMOUNT,SPROG.UNMOUNT,SPROG.UNMOUNT];
				this.state.confirmView = true;
				this.state.viewDiv = 'content';
				this.state.qsMode  = 'question';
				this.state.roll = '';
				this.state.shadowing = false;
			} else if(msg.msgtype === 'confirm_end') {
				if(msg.idx === 0) {
					console.log('confirmend sup');
					const qProg = this.state.confirmSupProg;
					if(this.state.viewDiv !== 'content') return;
					else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;
					this.state.confirmSupProg = QPROG.COMPLETE;
				} else if(msg.idx === 1) {
					const qProg = this.state.confirmBasicProg;
					if(this.state.viewDiv !== 'content') return;
					else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;
					this.state.confirmBasicProg = QPROG.COMPLETE;
				} else {
					const qProg = this.state.confirmHardProg;
					if(this.state.viewDiv !== 'content') return;
					else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;
					this.state.confirmHardProg = QPROG.COMPLETE;
				}
			} else if(msg.msgtype === 'additional_send') {
				if(msg.idx === 0) {
					if(this.state.additionalSupProg > QPROG.UNINIT) return;
					this.state.additionalSupProg = QPROG.ON;
					this.state.idx = 0;
				} else if(msg.idx === 1) {
					if(this.state.additionalBasicProg > QPROG.UNINIT) return;
					this.state.additionalBasicProg = QPROG.ON;
					this.state.idx = 1;
				} else {
					if(this.state.additionalHardProg > QPROG.UNINIT) return;
					this.state.additionalHardProg = QPROG.ON;
					this.state.idx = 2;
				}
				this.state.scriptProg = [SPROG.UNMOUNT,SPROG.UNMOUNT,SPROG.UNMOUNT];
				this.state.additionalView = true;
				this.state.viewDiv = 'content';
				this.state.qsMode  = 'question';
				this.state.roll = '';
				this.state.shadowing = false;
			} else if(msg.msgtype === 'additional_end') {
				if(msg.idx === 0) {
					const qProg = this.state.additionalSupProg;
					if(this.state.viewDiv !== 'content') return;
					else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;
					this.state.additionalSupProg = QPROG.COMPLETE;
				} else if(msg.idx === 1) {
					const qProg = this.state.additionalBasicProg;
					if(this.state.viewDiv !== 'content') return;
					else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;
					this.state.additionalBasicProg = QPROG.COMPLETE;
				} else {
					const qProg = this.state.additionalHardProg;
					if(this.state.viewDiv !== 'content') return;
					else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;
					this.state.additionalHardProg = QPROG.COMPLETE;
				}
			} else if(msg.msgtype === 'dictation_send') {
				console.log('dictation_send',msg.idx);
				if(this.state.dictationProg[msg.idx] > QPROG.UNINIT) return;
				this.state.dictationProg[msg.idx] = QPROG.ON;
				this.state.idx = msg.idx;
				this.state.scriptProg = [SPROG.UNMOUNT,SPROG.UNMOUNT,SPROG.UNMOUNT];
				this.state.dictationView = true;
				this.state.viewDiv = 'content';
				this.state.qsMode  = 'question';
				this.state.roll = '';
				this.state.shadowing = false;
			} else if(msg.msgtype === 'dictation_end') {
				const qProg = this.state.dictationProg[msg.idx];
				if(this.state.viewDiv !== 'content') return;
				else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;
				this.state.dictationProg[msg.idx] = QPROG.COMPLETE;
			} else if(msg.msgtype === 'script_send') {
				if(this.state.scriptProg[msg.idx] !== SPROG.UNMOUNT) return;
				
				this.state.idx = msg.idx;
				this.state.scriptProg[msg.idx] = SPROG.MOUNTED;
				this.state.viewDiv = 'content';
				this.state.qsMode  = 'script';
				this.state.roll = '';
				this.state.shadowing = false;
			} else if(msg.msgtype === 'qna_send') {
				console.log('msg.idx',msg.idx)
				if(this.state.viewDiv !== 'content') return;
				else if(this.state.scriptProg[msg.idx] !== SPROG.MOUNTED) return;
				this.state.focusIdx = -1;
				this.state.scriptProg[msg.idx] = SPROG.YESORNO;
				console.log('msg.idx 11',msg.idx)
			} else if(msg.msgtype === 'qna_end') {
				if(this.state.viewDiv !== 'content') return;
				else if(this.state.scriptProg[msg.idx] < SPROG.MOUNTED) return;
				this.state.scriptProg[msg.idx] = SPROG.MOUNTED;
			} else if(msg.msgtype === 'shadowing_send') {
				if(this.state.viewDiv !== 'content') return;
				else if(this.state.qsMode !== 'script') return;	
				this.state.roll = '';
				this.state.shadowing = true;
				this.state.focusIdx = -1;
			} else if(msg.msgtype === 'roll_send') {
				if(this.state.viewDiv !== 'content') return;
				else if(this.state.qsMode !== 'script') return;
				const rmsg = msg as common.IRollMsg;
				this.state.roll = rmsg.roll;
				this.state.shadowing = false;
				this.state.focusIdx = -1;
			} else if(msg.msgtype === 'playing' || msg.msgtype === 'paused') {
				if(this.state.viewDiv !== 'content') return;
				this.state.isPlay = (msg.msgtype === 'playing');
			} else if(msg.msgtype === 'focusidx') {
				if(this.state.viewDiv !== 'content') return;
				const fmsg = msg as common.IFocusMsg;
				this.state.focusIdx = fmsg.fidx;
			}
		}else if(data.type ===$SocketType.PAD_ONSCREEN){
			console.log('padonscreen')
			this.state.scriptProg = [SPROG.UNMOUNT,SPROG.UNMOUNT,SPROG.UNMOUNT]
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
		const scripts = this._data.scripts;
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
		for(let j = 0; j < scripts.length ; j++){
			for(let i = 0; i < scripts[j].length; i++) {
				const script = scripts[j][i];
				if(script.speaker === speakerA) script.roll = 'A';
				else if (script.speaker === speakerB) script.roll = 'B';
				else if (script.speaker === speakerC) script.roll = 'C';
				else if (script.speaker === speakerD) script.roll = 'D';
				else script.roll = 'E';
			}
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