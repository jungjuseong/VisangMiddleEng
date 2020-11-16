import * as React from 'react';
import * as _ from 'lodash';
import { observable, action } from 'mobx';
import { App } from '../../App';

import { TypeQuiz, IWordData, IData, IMsg, IQuizMsg, IDrillMsg, initData } from '../common';
import { StudentContextBase, IActionsBase, IStateBase, VIEWDIV } from '../../share/scontext';

type MYPROG = ''|'quiz'|'spelling'|'record';

interface IQuizInfo extends IStudentQuizInfo {
	quizType: TypeQuiz;
}

interface IStateCtx extends IStateBase {
	prog: MYPROG;
	quizProg: TypeQuizProg;
	groupProg: TypeGroupProg;
	startSelectedAni: boolean;
	forceStopIdx: number;
	qidx: number;
	point: number;
	ga_na: undefined|'ga'|'na';
	groupResult: ''|'win'|'lose'|'tie';
	isGroup: boolean;

	mediaType: 'audio'|'video';
	bRecordSend: boolean;
	recorded: string;
	uploaded: string;
	notice: string;
}

interface IActionsCtx extends IActionsBase {
	getWord: () => IWordData;
	getWords: () => IWordData[];
	getQuizInfo: () => IQuizInfo;
	setQuizProg: (prog: TypeQuizProg) => void;
	unsetForceStop: () => void;

	onStartRecord: () => void;
	onStopRecord: () => void;
	onUploadMedia: (url: string) => void;
	setFeedback: (feedback: 'off'|'on'|'sended') => void;
}

class StudentContext extends StudentContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;
	private _data!: IData;

	private _quizInfo: IQuizInfo = {
		quizIndices: [],
		points: [],
		quizTime: 0,
		quizType: '',
	};

	private _word!: IWordData;

	constructor() {
		super();

		this.state = {
			...this.state,
			prog: '',
			ga_na: undefined,
			qidx: 0,
			groupProg: '',
			startSelectedAni: false,
			forceStopIdx: -1,
			quizProg: '',
			isGroup: false,
			mediaType: 'audio',
			bRecordSend: false,
			recorded: '',
			uploaded: '',
			notice: '',
			groupResult: '',
		};

		this.actions = {
			...this.actions,
			getWord: () => this._word,
			getWords: () => this._data.page1.words,
			getQuizInfo: () => this._quizInfo,
			setQuizProg: (prog: TypeQuizProg) => 	this.state.quizProg = prog,
			unsetForceStop: () =>  this.state.forceStopIdx = -1,	

			onStartRecord: () => {
				this.state.notice = '';
				this.state.recorded = '';
				if(App.isDvlp) {
					_.delay(() => {
						if(this.state.mediaType === 'video') this.state.notice = 'notifyStartVideoRecord';
						else this.state.notice = 'notifyStartVoice';
					}, 300);
				}
			},
			onStopRecord: () => {
				this.state.notice = '';
				if(App.isDvlp) {
					_.delay(() => {
						if(this.state.mediaType === 'video') this.notifyVideoRecord('/content/B_ls_voca/data/LS_L6_U7_L1_10_watch.mp4');
						else this.notifyRecorded('/content/B_ls_voca/data/LS_L6_U7_L1_SENTENCE_10_watch.mp3');
					}, 300);
				}
			},
			onUploadMedia: (url: string) => {
				this.state.uploaded = '';
				if(App.isDvlp) {
					_.delay(() => {
						this.state.uploaded = url;
					}, 300);
				}
			},
		}
	}

	@action 
	protected _setViewDiv(newViewDiv: VIEWDIV) {
		const { viewDiv } = this.state;
		if(viewDiv !== newViewDiv) {
			if(viewDiv !== 'content') {
				this.state = {
					...this.state,
					prog: '',
					groupProg: '',
					forceStopIdx: -1,
					ga_na: undefined,
				};
			}
		}
		super._setViewDiv(newViewDiv);
	}

	@action 
	public receive(data: ISocketData) {
		super.receive(data);

		const { viewDiv, prog, ga_na, quizProg, isGroup,groupProg } = this.state;
		if(data.type === $SocketType.MSGTOPAD && data.data) {

			const padMessage =  data.data as IMsg;
			
			switch (padMessage.msgtype) {
			case 'quiz': // 문제수/시간 설정에서 start 버튼 클릭시
				// const quizMessage = padMessage as IQuizMsg;
				const { quizIndices, quizTime, quizType, isGroup } = padMessage as IQuizMsg;
				this._quizInfo = {
					...this._quizInfo,
					quizIndices,
					points: [],
					quizTime,
					quizType,
				}
				for(let i = 0; i < quizIndices.length; i++) {
					this._quizInfo.points[i] = 0;
				}

				this.state.isGroup = isGroup;
				this.state.forceStopIdx = -1;

				this.actions.setQuizProg('');
				this.state.qidx = 0;
				this._setViewDiv('content');

				this.state = {
					...this.state,
					groupResult: '',
					prog: 'quiz',
					groupProg: (this.state.isGroup) ? 'inited' : this.state.groupProg,
				}
				break;

			case 'force_stop':
				if(viewDiv === 'content' && prog === 'quiz' && (quizProg === '' || quizProg === 'quiz')) {
					const flipMessage = padMessage as IFlipMsg;
					this.state.forceStopIdx = flipMessage.idx;
				}
				break;
			case 'start_quiz': // 타이머 스타트 시
				if(viewDiv === 'content' && prog === 'quiz' && quizProg === '') {
					const quizIndexMessage = padMessage as IMsgQuizIdx;
					this.state.qidx = quizIndexMessage.quizIndex;
					this.actions.setQuizProg('quiz');
				}
				break;
			case 'pad_gana': // 팀 A, B 결정
				const ganaMessage = padMessage as IMsgGaNa;
				if(App.student) {
					let ga_na: undefined|'ga'|'na';
					if(App.student.id === ganaMessage.ga) ga_na = 'ga';
					else if(App.student.id === ganaMessage.na) ga_na = 'na';
					
					if(ga_na) {
						this._quizInfo = {
							...this._quizInfo,
							quizIndices: [],
							points: [],
							quizTime: 5,
						}

						// needs testing
						this.state = {
							...this.state,
							isGroup: true,
							ga_na: ga_na,
							groupProg: 'initing',
							prog: 'quiz',
							startSelectedAni: false,
						}
			
						this.actions.setQuizProg('');
						this._setViewDiv('content');

						_.delay(() => {
							if(groupProg === 'initing') this.state.startSelectedAni = true;														
						}, 10);
					}
				}
				break;
			case 'send_point': // 그룹일 경우 포인트 전달
				if(!isGroup || prog !== 'quiz' || groupProg !== 'inited') return;

				const sendPointMessage = padMessage as IMsgQuizIdx;
				this._quizInfo.points[sendPointMessage.quizIndex] = sendPointMessage.point;
				this.state.qidx = sendPointMessage.quizIndex;
				this.state.groupProg = 'onquiz';

				this.actions.setQuizProg('');
				break;
			case 'next_quiz': // 그룹일 경우 스핀들 버튼 클릭시
				if(!isGroup || prog != 'quiz') return;

				const nexQuizMessage = padMessage as IMsgQuizIdx;
				this.state.qidx = nexQuizMessage.quizIndex;
				
				this.state.groupProg = 'inited';
				this.actions.setQuizProg('');
				break;

			case 'end_quiz':           // 그룹일 경우  모든 계산이 완료.
				if(!isGroup || prog !== 'quiz') return;

				const endQuizMessage = padMessage as IMsgGaNaResult;
				if(endQuizMessage.ga_point === endQuizMessage.na_point) this.state.groupResult = 'tie';
				else if(endQuizMessage.ga_point > endQuizMessage.na_point && ga_na === 'ga') this.state.groupResult = 'win';
				else if(endQuizMessage.ga_point < endQuizMessage.na_point && ga_na === 'na') this.state.groupResult = 'win';
				else this.state.groupResult = 'lose';
					
				// this.state.qidx = 0;
				this.state.groupProg = 'complete';
				this.actions.setQuizProg('result');
				break;
			case 'spelling':
			case 'speak_audio':
			case 'speak_video':
			case 'speaking_audio':
			case 'speaking_video':			
				const drillMessage = padMessage as IDrillMsg;

				const word = _.find(this._data.page1.words, {idx: drillMessage.word_idx});
				if(word) {
					this._word = word;
					this._setViewDiv('content');
					this.state.mediaType = (padMessage.msgtype === 'speak_video' || padMessage.msgtype === 'speaking_video') ? 'video' : 'audio';

					if(padMessage.msgtype === 'spelling') this.state.prog = padMessage.msgtype;
					else this.state.prog = 'record';

					this.state.bRecordSend = (
						padMessage.msgtype === 'speak_audio' || padMessage.msgtype === 'speak_video' ||
						padMessage.msgtype === 'speaking_audio' || padMessage.msgtype === 'speaking_video'
					);
				}
			}
		}
	}

	public uploaded = (url: string) => {
		if(this.state.viewDiv === 'content' && this.state.prog === 'record') {
			this.state.uploaded = url;
		}
	}
	@action public notify = (type: string) => {
		if(this.state.viewDiv === 'content' && this.state.prog === 'record') {
			this.state.notice = type;
		}
	}

	private _recorded(url: string, type: 'audio'|'video') {
		this.state.notice = '';
		_.delay(() => {
			if(
				this.state.viewDiv === 'content' && 
				this.state.mediaType === type &&
				this.state.prog === 'record'
			) {
				this.state.recorded = url;
			}
		}, 300);
	}
	@action public notifyRecorded = (url: string) => {
		if(	
			this.state.viewDiv === 'content' && 
			this.state.mediaType === 'audio' && 
			this.state.prog === 'record'
		) {
			this._recorded(url, this.state.mediaType);
		}
	}
	public notifyVideoRecord = (url: string) => {
		if(	
			this.state.viewDiv === 'content' && 
			this.state.mediaType === 'video' && 
			this.state.prog === 'record'
		) {
			this._recorded(url, this.state.mediaType);
		}
	}

	public setData(data: IData) {
		data = initData(data);
		const words = data.page1.words;
		for(let i = 0; i < words.length; i++) {
			const word = words[i];

			word.app_idx = i;
			word.app_checked = false;
			word.app_studied = false;
			word.app_result = false;

			word.app_sound = 0;
			word.app_meaning = 0;
			word.app_spelling = 0;
			word.app_sentence = 0;
		}
		this._word = words[0];
		this._data = data;		
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
};