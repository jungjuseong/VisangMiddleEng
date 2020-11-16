import * as React from 'react';
import { observable, action } from 'mobx';

import * as _ from 'lodash';
import { IMsg, IData, IFocusMsg, IRollMsg } from '../common';
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
	questionProg: QPROG;
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
			questionProg: QPROG.UNINIT,
			scriptProg: SPROG.UNMOUNT,
			scriptMode: 'COMPREHENSION',
			qsMode : '',
			roll: '',
			viewClue: false,
			focusIdx: -1,
			isPlay: false,
			shadowing: false,
		}
		this.actions.getData = () => this._data;
	}

	@action 
	protected _setViewDiv(newViewDiv: VIEWDIV) {
		const {viewDiv} = this.state;
		if(viewDiv !== newViewDiv) {
			if(this.state.questionProg < QPROG.COMPLETE) this.state.questionProg = QPROG.UNINIT;
			
			this.state = {
				...this.state,
				questionView: false,
				scriptProg: SPROG.UNMOUNT,
				qsMode: '',
				roll: '',
				viewClue: false,
				shadowing: false,
				isPlay: false,
				focusIdx: -1,
			}
		}
		super._setViewDiv(newViewDiv);
	}
	@action 
	public receive(data: ISocketData) {
		super.receive(data);

		const { viewDiv,scriptProg,scriptMode, qsMode, questionProg } = this.state;
		// console.log('receive', data);
		if(data.type === $SocketType.MSGTOPAD && data.data) {
			const padMessage = data.data as  IMsg;
			switch(padMessage.msgtype) {
			case 'quiz_send':
				this.state = {
					...this.state,
					scriptProg: SPROG.UNMOUNT,
					questionView: true,
					questionProg: QPROG.ON,
					viewDiv: 'content',
					scriptMode : 'COMPREHENSION',
					qsMode : 'question',
					roll: '',
					shadowing: false,
				};
				break;
			case 'quiz_end':
				const qProg = this.state.questionProg;
				if(this.state.viewDiv !== 'content') return;
				else if(qProg !== QPROG.ON && qProg !== QPROG.SENDING && qProg !== QPROG.SENDED) return;

				this.state.questionProg = QPROG.COMPLETE;
				break;
			case 'script_send':
				if(scriptProg !== SPROG.UNMOUNT) return;
				if(questionProg < QPROG.COMPLETE) this.state.questionProg = QPROG.READYA;

				this.state = {
					...this.state,
					questionView: true,
					scriptProg: SPROG.MOUNTED,
					viewDiv: 'content',
					scriptMode: 'COMPREHENSION',
					qsMode: 'script',
					roll: '',
					shadowing: false,
				}
				break;
			case 'view_clue':
				if(viewDiv !== 'content' || scriptProg === SPROG.UNMOUNT) return;

				this.state = {
					...this.state,
					qsMode: 'script',
					viewClue: true,
				}
				break;
			case 'hide_clue':
				if(viewDiv !== 'content' || scriptProg === SPROG.UNMOUNT) return;
				this.state.viewClue = false;
				break;
			case 'qna_send':
				if(viewDiv !== 'content' || scriptProg !== SPROG.MOUNTED) return;

				this.state = {
					...this.state,
					focusIdx: -1,
					scriptProg: SPROG.YESORNO,
				}
				break;
			case 'qna_end':
				if(viewDiv !== 'content' || scriptProg < SPROG.MOUNTED) return;
				this.state.scriptProg = SPROG.MOUNTED;
				break;
			case 'dialogue_send':
		
				this.state = {
					...this.state,
					scriptProg: SPROG.UNMOUNT,
					viewDiv: 'content',
					scriptMode : 'DIALOGUE',
					qsMode : 'script',
					roll: '',
					shadowing: false,
					viewClue: false,
					focusIdx: -1,	
				};
				if(questionProg < QPROG.COMPLETE) this.state.questionProg = QPROG.UNINIT;
	
				break;
			case 'dialogue_end':
				this.state = {
					...this.state,
					roll: '',
					shadowing: false,
					isPlay: false,
					focusIdx: -1
				}
				break;		
			case 'roll_send':
				if(viewDiv !== 'content' || scriptMode !== 'DIALOGUE' || qsMode !== 'script') return;

				this.state = {
					...this.state,
					roll: (padMessage as IRollMsg).roll,
					shadowing: false,
					focusIdx: -1
				}
				break;
			case 'shadowing_send':
				if(viewDiv !== 'content' || scriptMode !== 'DIALOGUE' || qsMode !== 'script') return;	
				this.state = {
					...this.state,
					roll: '',
					shadowing: true,
					focusIdx: -1
				}
				break

			case 'playing':
			case 'paused':
				if(viewDiv !== 'content') return;
				this.state.isPlay = (padMessage.msgtype === 'playing');
				break;
			case'focusidx':
				if(viewDiv !== 'content' || scriptMode === 'COMPREHENSION') return;
				const focusMessage = padMessage as IFocusMsg;
				this.state.focusIdx = focusMessage.idx;
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

		const { scripts, speakerA, speakerB, speakerC, speakerD, speakerE } = this._data;

		if(!speakerD) {
			this._data.speakerD = {
				name: '',
				image_s: '',
				image_l: '',
			};
		}
		if(!speakerE) {
			this._data.speakerE = {
				name: '',
				image_s: '',
				image_l: '',
			};
		}

		for(let i = 0; i < this._data.quizs.length; i++) {
			const quizes = this._data.quizs[i];
			const arr = quizes.question.split('<br>');
			
			quizes.app_question = (
				<>{
					arr.map((str, idx) => {
						if(idx > 0) return <React.Fragment key={idx}><br/>{str}</React.Fragment>;
						else return str;
					})
				}</>
			);
		}
		scripts.forEach((script) => {
			if(script.dms_speaker === speakerA.name) script.roll = 'A';
			else if (script.dms_speaker === speakerB.name) script.roll = 'B';
			else if (script.dms_speaker === speakerC.name) script.roll = 'C';
			else if (script.dms_speaker === speakerD.name) script.roll = 'D';
			else script.roll = 'E';
		});
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