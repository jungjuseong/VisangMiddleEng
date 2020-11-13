import * as React from 'react';
import { observable, action } from 'mobx';

import * as _ from 'lodash';
import { IMsg,IData,IRollMsg,IFocusMsg } from '../common';
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
	getData: () => IData;
}

class StudentContext extends StudentContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;
	private _data!: IData;

	constructor() {
		super();

		this.state = {
			...this.state,
			questionView: false,
			confirmProg: QPROG.UNINIT,
			scriptProg: SPROG.UNMOUNT,
			scriptMode: 'COMPREHENSION',
			qsMode: '',
			roll: '',
			viewClue: false,
			focusIdx: -1,
			isPlay: false,
			shadowing: false
		};
		this.actions.getData = () => this._data
	}

	@action protected _setViewDiv(newViewDiv: VIEWDIV) {
		const { viewDiv } = this.state;
		if(viewDiv !== newViewDiv) {
			this.state.questionView = false;
			if(this.state.confirmProg < QPROG.COMPLETE) this.state.confirmProg = QPROG.UNINIT;
		
			this.state = {
				...this.state,
				scriptProg: SPROG.UNMOUNT,
				qsMode: '',
				roll: '',
				viewClue: false,
				shadowing: false,
				isPlay: false,
				focusIdx: -1
			}
		}
		super._setViewDiv(newViewDiv);
	}

	@action public receive(data: ISocketData) {
		const { viewDiv,confirmProg,scriptProg,scriptMode,qsMode } = this.state;
		super.receive(data);

		if(data.type === $SocketType.MSGTOPAD && data.data) {
			const messageType = (data.data as IMsg).msgtype;

			switch(messageType) {
				case 'quiz_send':
					this.state = {
						...this.state,
						scriptProg: SPROG.UNMOUNT,
						questionView: true,
						confirmProg: QPROG.ON,
						viewDiv: 'content',
						scriptMode: 'COMPREHENSION',
						qsMode: 'question',
						roll: '',
						shadowing: false,
					};
					break;
				case 'quiz_end':
					if(viewDiv !== 'content' || ![QPROG.ON,QPROG.SENDED,QPROG.SENDING].includes(confirmProg)) return;
					//else if(questionProg !== QPROG.ON && questionProg !== QPROG.SENDING && questionProg !== QPROG.SENDED) return;
					this.state = {
						...this.state,
						confirmProg: QPROG.COMPLETE
					}
					break;
				case 'script_send':
					if(scriptProg !== SPROG.UNMOUNT) return;
					if(confirmProg < QPROG.COMPLETE) this.state.confirmProg = QPROG.READYA;
					this.state = {
						...this.state,
						scriptProg: SPROG.MOUNTED,
						questionView: true,
						viewDiv: 'content',
						scriptMode: 'COMPREHENSION',
						qsMode: 'script',
						roll: '',
						shadowing: false,
					};
					break;
				case 'view_clue':
					if(viewDiv !== 'content' || scriptProg === SPROG.UNMOUNT) return;

					this.state = {
						...this.state,
						viewClue: true,
						qsMode: 'script',
					};
					break;
				case 'hide_clue':
					if(viewDiv !== 'content' || scriptProg === SPROG.UNMOUNT) return;
					this.state = {
						...this.state,
						viewClue: false,
					};
					break;
				case 'qna_send':
					if(viewDiv !== 'content' || scriptProg !== SPROG.MOUNTED) return;
					this.state = {
						...this.state,
						focusIdx: -1,
						scriptProg: SPROG.YESORNO,
					};
					break;
				case 'qna_end':
					if(viewDiv !== 'content' || scriptProg < SPROG.MOUNTED) return;
					this.state = {
						...this.state,
						scriptProg: SPROG.MOUNTED,
					};
					break;
				case 'dialogue_send':
					this.state = {
						...this.state,
						scriptProg: SPROG.UNMOUNT,
						confirmProg: (confirmProg < QPROG.COMPLETE) ? QPROG.UNINIT : this.state.confirmProg,
						viewDiv: 'content',
						scriptMode: 'DIALOGUE',
						qsMode: 'script',
						roll:'',
						shadowing: false,
						viewClue: false,
						focusIdx: -1,
					};
					break;			
				case 'dialogue_end':
					this.state = {
						...this.state,
						roll: '',
						shadowing: false,
						isPlay: false,
						focusIdx: -1
					};
					break;	
				case 'roll_send':
					if(viewDiv !== 'content' || scriptMode !== 'DIALOGUE' || qsMode !== 'script') return;
					this.state = {
						...this.state,
						roll: (data.data as IRollMsg).roll,
						shadowing: false,
						focusIdx: -1,
					};
					break;
				case 'shadowing_send':
					if(viewDiv !== 'content' || scriptMode !== 'DIALOGUE' || qsMode !== 'script') return;
					this.state = {
						...this.state,
						roll: '',
						shadowing: true,
						focusIdx: -1,
					};
					break;
				case 'playing':
				case 'paused':
					if(viewDiv !== 'content') return;
					this.state = {
						...this.state,
						isPlay: (messageType === 'playing') 
					}
					break;
				case 'focusidx':
					if(viewDiv !== 'content' || scriptMode === 'COMPREHENSION') return;
					this.state = {
						...this.state,
						focusIdx: (data.data as IFocusMsg).idx,
					};
					break;
				default:
					break;
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
		this._data = data as IData;
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