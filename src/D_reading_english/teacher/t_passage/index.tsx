import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { IStateCtx, IActionsCtx, SENDPROG, BTN_DISABLE } from '../t_store';
import { App } from '../../../App';
import * as felsocket from '../../../felsocket';
import { ToggleBtn } from '@common/component/button';
import NItem from '@common/component/NItem';
import * as kutil from '@common/util/kutil';
import { IQNAMsg, IPassage, IScript,IMsgForIdx ,IMsg, IData, IQnaReturn } from '../../common';
import { observable } from 'mobx';
import SendUI from '../../../share/sendui_new';
import * as style from '../../../share/style';
import { MPlayer, MConfig, IMedia, MPRState } from '@common/mplayer/mplayer';
import { CountDown2, TimerState } from '../../../share/Timer';
import Yourturn from '../../../share/yourturn';

import TransPopup from './_trans_popup';
import SentenceStructure from './_sentence_struct_popup';
import PassagePopup from './_passage_popup';
import ImgPassage from './_img_passage';
import ScriptItem from './_script_item';

const SwiperComponent = require('react-id-swiper').default;

interface IInfo {
	passage: IPassage;
	scripts: IScript[];
	qnaRets: IQnaReturn[];
}

type _ComprehensionTabType = 'Warmup'|'Question';

interface IPassageProps {
	view: boolean;
    videoPopup: boolean;
    viewStoryBook: boolean;
	studying: boolean;
	inview: boolean;
	data: IData;
	state: IStateCtx;
	actions: IActionsCtx;
	onStudy: (studying: BTN_DISABLE) => void;
	onSetNavi: (title: 'Comprehension', tab: _ComprehensionTabType) => void;
}

@observer
class Passage extends React.Component<IPassageProps> {
	private _player = new MPlayer(new MConfig(false));
	private _swiper: Swiper|null = null;

	@observable private _curIdx = 0;
	@observable private _curSeq = -1;
	@observable private _zoom = false;
	@observable private _pass_pop: 'off'|'READALOUD'|'SHADOWING'|'QNA' = 'off';
	@observable private _studyDiv: 'off'|'READALOUD'|'SHADOWING'|'QNA' = 'off';

	@observable private _trans = false;
	@observable private _view_structure = false;

	@observable private _prog = SENDPROG.READY;
	@observable private _studyProg = SENDPROG.READY;
	@observable private _retCnt = 0;
	@observable private _numOfStudent = 0;
	@observable private _audioOn = false;

	private _countdown = new TimerState(3);
	@observable private _viewCountDown = false;
	@observable private _yourturn = -1;
	@observable private _ytNext = -1;

	private _infos: IInfo[] = [];
	private _retUsers: string[] = [];

	@observable private _opt = true;

	constructor(props: IPassageProps) {
		super(props);
		
		const { passage, scripts } = props.data;

		for(let i = 0; i < passage.length; i++) {
			const info: IInfo = {
				passage: passage[i],
				scripts: [],
				qnaRets: [],			
			};

			for(let j = 0; j < scripts.length; j++) {
				if(scripts[j].passage_page === passage[i].page) {
					info.scripts.push(scripts[j]);
					info.qnaRets.push({num: 0, users: []});
				}
			}
			this._infos.push(info);
		}
	}

	private _refAudio = (audio: HTMLAudioElement|null) => {
		const { data } = this.props;

		if(audio && !this._player.media) { 	
			this._player.mediaInited(audio as IMedia);
			this._player.load(App.data_url + data.audio);
			this._player.addOnTime((time: number) => {
				// console.log(time);
				let current_script = this._getScriptBetweenTime(this._infos[this._curIdx].scripts, time);

				if(current_script.seq >= 0 && current_script.seq !== this._curSeq) {
					if(this._studyDiv === 'READALOUD') {
						this._curSeq = current_script.seq;
						felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'focusidx',idx: current_script.seq,});
						this._transAt(current_script.seq);
					} 
					else if((this._studyDiv === 'off' || this._studyDiv === 'QNA') && this._audioOn) {
						if(current_script.passage_page >= 0 && current_script.passage_page > (this._curIdx + 1)) {
							this._curIdx = current_script.passage_page - 1;
							if(this._swiper) {
								this._swiper.update();
								if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
							}
						}
						this._curSeq = current_script.seq;	
						felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'focusidx',idx: current_script.seq,});
						this._transAt(current_script.seq);
					}
				}
			});

			this._player.addOnPlayEnd(() => {
				if(this._studyDiv === 'READALOUD') felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'dialogue_end'});	
				else if(this._studyDiv === 'SHADOWING') if(this._handleYourTurn(true)) return;
				
				this._audioOn = false;
				this._curSeq = -1;
			});

			this._player.addOnPlayEndTemp(() => {
				if(this._studyDiv === 'READALOUD') {
					this._curSeq = -1;
					felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'dialogue_end'});		
				} 
				else if(this._studyDiv === 'SHADOWING') {
					if(this._curSeq < 0) return;
					this._handleYourTurn(false);
				} 
				else {
					if(this._audioOn) this._audioOn = false;
					this._curSeq = -1;
				}
			});

			this._player.addOnState((newState: MPRState, oldState: MPRState) => {
				if(this._studyDiv === 'SHADOWING' || this._studyDiv === 'READALOUD') {
					let msgtype = 'paused';

					if(this._studyDiv === 'SHADOWING' && this._yourturn >= 0) msgtype = 'playing';
					else if(newState !== MPRState.PAUSED && this._player.bPlay) msgtype = 'playing';

					felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype});
				}
			});

		}
	}

	private _handleYourTurn(forceEnd: boolean) {
		const scripts = this._infos[this._curIdx].scripts;

		if(this._curSeq >= 0) {
			let idx = -1;
			for(let i = 0; i < scripts.length; i++) {
				if(scripts[i].seq === this._curSeq) {
					idx = i;
					break;
				}
			}
			if(idx >= 0) {
				const curent_script = scripts[idx];
				const next = (idx < scripts.length - 1) ? scripts[idx + 1] : null;
				const delay = (curent_script.audio_end - curent_script.audio_start) * 1900;

				felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'view_yourturn', idx: curent_script.seq});
				
				this._yourturn = _.delay(() => {			
					this._yourturn = -1;
					if(this._studyDiv === 'SHADOWING') {
						_.delay(() => {
							if(!next || forceEnd) {
								this._curSeq = -1;
								felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'dialogue_end'});					
							}
							else {
								this._curSeq = next.seq;
								if(this._curSeq >= 0) this._transAt(this._curSeq);
								felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'focusidx',idx: next.seq,});
								this._player.gotoAndPlay(next.audio_start * 1000, next.audio_end * 1000, 1);
							}					
						}, 300);
					}
				}, delay);

				felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'playing'});	
				return true;
			}
			return false;
		}
		return false;
	}

	private _transAt(seq: number) {
		if(this._swiper && this._swiper.wrapperEl) {
			const gap = 82;
			const s_box = document.getElementById('script_box');
			const s_bnd = document.getElementById('script-bnd');
			const s_el = document.getElementById('script_' + seq);
			
			if(s_box && s_el && s_bnd) {
				const boxRect = s_box.getBoundingClientRect();
				const bndRect = s_bnd.getBoundingClientRect();

				const diff = (boxRect.bottom - boxRect.top) - (bndRect.bottom - bndRect.top);
				if( diff < 0) {
					const sRect = s_el.getBoundingClientRect();

					if(sRect.top < boxRect.top + gap ) {
						const current = this._swiper.translate;
						let trans = current + (boxRect.top + gap - sRect.top);
						if(trans > 0) trans = 0;
						this._swiper.wrapperEl.style.transitionDuration = '300ms';
						this._swiper.setTranslate(trans);
					} else if(sRect.bottom > boxRect.bottom - gap) {
						const cur = this._swiper.translate;
						let trans = cur - (sRect.bottom - (boxRect.bottom - gap));
						if(trans < diff) trans = diff;
						this._swiper.wrapperEl.style.transitionDuration = '300ms';
						this._swiper.setTranslate(trans);
					}
				}
			}
		}	
	}

	private _initAll() {
		this._pass_pop = 'off';
		this._prog = SENDPROG.READY;
		this._initStudy();
		felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
	}

	private _initStudy() {
		this._zoom = false;
		this._studyDiv = 'off';
		this._trans = false;
		this._view_structure = false;
		this._studyProg = SENDPROG.READY;
		this._retCnt = 0;

		while(this._retUsers.length > 0) this._retUsers.pop();

		this._audioOn = false;
		this._curSeq = -1;

		this._countdown.pause();
		this._countdown.reset();
		this._viewCountDown = false;
		if(	this._yourturn >= 0) {
			clearTimeout(this._yourturn);
			this._yourturn = -1;
		}
		if(this._player.bPlay) this._player.pause();
		if(this._swiper) this._swiper.slideTo(0);
		
		this.props.onStudy('');
		this.props.actions.setQNAFnc(null);
	}

	private _onPage = async (idx: number) => {
		const { studying } = this.props;

		if(!studying) {
			if(idx !== this._curIdx && idx >= 0 && idx < this._infos.length) {
				App.pub_playBtnPage();
				this._initAll();
				this._curIdx = idx;
				await kutil.wait(300);
				if(this._swiper) {
					this._swiper.update();
					if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
					this._opt = (this._swiper.wrapperEl.scrollHeight <= this._swiper.height)
				}
			}
		}
	}
	
	private _clickReturn = () => {
		App.pub_playBtnTab();
		felsocket.startStudentReportProcess($ReportType.JOIN, this._retUsers);		
	}

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;
		this._swiper = el.swiper;
	}

	private _onSend = () => {
		const { view, inview } = this.props;

		if(view && inview && this._prog === SENDPROG.READY) {
			this._prog = SENDPROG.SENDING;
			App.pub_playToPad();

			this._retCnt = 0;
			while(this._retUsers.length > 0) this._retUsers.pop();

			felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'passage_send', idx: this._curIdx});
			App.pub_reloadStudents(async () => {
				if(view && inview && this._prog === SENDPROG.SENDING) {
					this._numOfStudent = App.students.length;
					await kutil.wait(600);
					this._prog = SENDPROG.SENT;
				}
			});
		}
	}

	private _clickTrans = () => {
		App.pub_playBtnTab();
		this._trans = !this._trans;
		felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'view_trans', idx: this._trans ? 1 : 0});		
	}

	private _clickStructure = () => {
		App.pub_playBtnTab();
		this._view_structure = !this._view_structure;
	}

	private _offTrans = () => {
		this._trans = false;
		const msg: IMsgForIdx = {msgtype: 'view_trans', idx: this._trans ? 1 : 0};
		felsocket.sendPAD($SocketType.MSGTOPAD, msg);		
	}

	private _offStructure = () => {
		this._view_structure = false;		
	}

	private _clickZoom = () => {
		App.pub_playBtnTab();
		this._zoom = !this._zoom;
		this.props.actions.setNaviView(false);
	}

	private _offZoom = () => {
		this._zoom = false;
		this._setNavi();
	}

	private _onPopupClosed = () => {
		this._pass_pop = 'off';
		if(this._studyDiv === 'off') this.props.actions.setNaviView(true);
	}

	private _onReadClick = () => {
		const { view, inview, actions } = this.props;
		console.log('onReadClick');

		if(view && inview && this._prog === SENDPROG.SENT) {
			App.pub_playBtnTab();
			this._initStudy();
			if(this._studyDiv === 'READALOUD') {
				this._studyDiv = 'off';
				felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'dialogue_end'});
				actions.setNaviView(true);
			} 
			else if(this._pass_pop === 'off') {
				this._pass_pop = 'READALOUD';
				actions.setNaviView(false);
			}
		}
	}

	private _onShadowClick = () => {
		const { actions, inview, view } = this.props;

		if(view && inview && this._prog === SENDPROG.SENT) {
			App.pub_playBtnTab();
			this._initStudy();
			if(this._studyDiv === 'SHADOWING') {
				this._studyDiv = 'off';
				felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'dialogue_end'});
				actions.setNaviView(true);
			} 
			else if(this._pass_pop === 'off') {
				this._pass_pop = 'SHADOWING';
				actions.setNaviView(false);
			}
		}
	}

	private _onQAClick = () => {
		const { actions, inview, view } = this.props;

		if(view && inview && this._prog === SENDPROG.SENT) {
			App.pub_playBtnTab();
			this._initStudy();
			if(this._studyDiv === 'QNA') {
				this._studyDiv = 'off';
				felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'dialogue_end'});
				actions.setNaviView(true);
			} 
			else if(this._pass_pop === 'off') {
				this._pass_pop = 'QNA';
				actions.setNaviView(false);
			}
		}
	}

	private _setNavi() {
		const { state, actions,onSetNavi } = this.props;

		actions.setNaviView((this._studyDiv === 'off'));
		actions.setNavi(true, true);
		// actions.setNaviFnc(
		// 	async () => {
		// 		if(this._curIdx === 0) {
		// 			state.isNaviBack = true;
		// 			onSetNavi('Comprehension','Warmup');
		// 		} 
		// 		else {
		// 			App.pub_playBtnPage();
		// 			// const info = this._infos[this._curIdx + 1];
		// 			this._initAll();
		// 			this._curIdx = this._curIdx - 1;

		// 			await kutil.wait(300);
		// 			if(this._swiper) {
		// 				this._swiper.update();
		// 				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
		// 				this._opt = (this._swiper.wrapperEl.scrollHeight <= this._swiper.height);
		// 			}
		// 		}
		// 	},
		// 	async () => {
		// 		if(this._curIdx >= this._infos.length - 1) onSetNavi('Comprehension','Question');
		// 		else {
		// 			App.pub_playBtnPage();
		// 			// const info = this._infos[this._curIdx + 1];
		// 			this._initAll();
		// 			this._curIdx = this._curIdx + 1;

		// 			await kutil.wait(300);
		// 			if(this._swiper) {
		// 				this._swiper.update();
		// 				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
		// 				this._opt = (this._swiper.wrapperEl.scrollHeight <= this._swiper.height);
		// 			}
		// 		}
		// 	}
		// );
		const _setSwiper = (tab: _ComprehensionTabType) => {
			return async () => {
				if(this._curIdx === 0) {
					state.isNaviBack = true;
					onSetNavi('Comprehension', tab);
				}
				else {
					App.pub_playBtnPage();
					this._initAll();
					this._curIdx = this._curIdx - 1;

					await kutil.wait(300);
					if(this._swiper) {
						this._swiper.update();
						if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
						this._opt = (this._swiper.wrapperEl.scrollHeight <= this._swiper.height);
					}
				}
			}
		}
		actions.setNaviFnc(_setSwiper('Warmup'), _setSwiper('Question'));
	}

	public componentDidUpdate(prev: IPassageProps) {
		const { state, inview, videoPopup,viewStoryBook, view } = this.props;

		if(view && !prev.view) {
			this._initAll();
			this._curIdx = 0;
		} 
		else if(!view && prev.view) {
			if(this._player.bPlay) this._player.pause();
			if(this._audioOn) this._audioOn = false;
		}

		if(videoPopup && !prev.videoPopup) {
			if(state.isVideoStudied) state.isVideoStudied = false;
			this._player.pause();
			this._audioOn = false;
			this._curSeq = -1;
		} 
		else if (!videoPopup && prev.videoPopup) {
			if(state.isVideoStudied) {
				this._initAll();
				this._curIdx = 0;
				_.delay( () => {
					if(this._swiper) {
						this._swiper.update();
						if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();						
					}
				}, 300);
			} 
		}

		if(inview && !prev.inview) {
			this._initAll();
			this._setNavi();
			if(state.isNaviBack) {
				this._curIdx = this._infos.length - 1;
				state.isNaviBack = false;
			}
			_.delay( () => {
				if(this._swiper) {
					this._swiper.update();
					if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
					this._opt = (this._swiper.wrapperEl.scrollHeight <= this._swiper.height);					
				}
			}, 300);
		} else if (!inview && prev.inview) {
			if(this._player.bPlay) this._player.pause();
			if(this._audioOn) this._audioOn = false;
        }
		
		if(inview && prev.inview) {
			if (!videoPopup && prev.videoPopup) this._setNavi();
			else if(!viewStoryBook && prev.viewStoryBook) this._setNavi();
		}
	}

	private _onAudio = () => {
		if(this._studyDiv === 'READALOUD' || this._studyDiv === 'SHADOWING') return;

		App.pub_playBtnTab();
		this._audioOn = !this._audioOn;

		if(this._player.bPlay) this._player.pause();

		if(this._audioOn) {
			this._curSeq = -1;
			const passage = this._infos[this._curIdx].passage;
			this._player.gotoAndPlay(passage.start * 1000, passage.end * 1000, 1);
			if(this._swiper) {
				this._swiper.update();
				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
			}
		} else {
			this._curSeq = -1;
			// this._curIdx = 0;
			if(this._swiper) {
				this._swiper.update();
				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
			}
		}
	}

	private _onChoose = (script: IScript) => {
		if(this._studyDiv !== 'READALOUD' && this._studyDiv !== 'SHADOWING') {
			if(this._audioOn) this._audioOn = false;

			const prevSeq = this._curSeq;
			this._curSeq = script.seq;
			this._transAt(this._curSeq);
			App.pub_playBtnTab();

			if(this._curSeq === prevSeq) {
				if(this._player.bPlay) {
					this._player.pause();
					this._curSeq = -1;
				} else this._player.gotoAndPlay(script.audio_start * 1000, script.audio_end * 1000, 1);
			} else {
				this._player.gotoAndPlay(script.audio_start * 1000, script.audio_end * 1000, 1);
			}
		}
	}

	private _studySend = async () => {
		const { actions, view, inview, onStudy } = this.props;

		if(view && inview && this._prog === SENDPROG.SENT && this._studyDiv === 'off' && this._studyProg === SENDPROG.READY) {
			App.pub_playToPad();

			let msgtype: 'readaloud_send'|'shadowing_send'|'qna_send';

			if(this._pass_pop === 'READALOUD') msgtype = 'readaloud_send';
			else if(this._pass_pop === 'SHADOWING') msgtype = 'shadowing_send';
			else if(this._pass_pop === 'QNA') { 
				msgtype = 'qna_send';
				const qnaRets = this._infos[this._curIdx].qnaRets;
				for(let i = 0; i < qnaRets.length; i++) {
					while(qnaRets[i].users.length > 0) qnaRets[i].users.pop();
					qnaRets[i].num = 0;
				}
			} else return;

			this._retCnt = 0;
			while(this._retUsers.length > 0) this._retUsers.pop();
			this._studyProg = SENDPROG.SENDING;
			this._studyDiv = this._pass_pop;

			onStudy(this._pass_pop === 'QNA' ? 'ex_video' : 'all');

			felsocket.sendPAD($SocketType.MSGTOPAD, { msgtype, idx: this._curIdx });

			await kutil.wait(500);
			if(view && inview && this._prog === SENDPROG.SENT && this._studyProg === SENDPROG.SENDING) {			
				this._studyProg = SENDPROG.SENT;
				this._pass_pop = 'off';
				this._numOfStudent = App.students.length;
				if(this._studyDiv === 'READALOUD' || this._studyDiv === 'SHADOWING') {
					this._viewCountDown = true;
					this._countdown.reset();
					await kutil.wait(300);
					this._countdown.start();					
				} else if(this._studyDiv === 'QNA') actions.setQNAFnc(this._onQNA);
			}
		}
	}

	private _onQNA = (qmsg: IQNAMsg) => {
		if(this._studyDiv === 'QNA') {
			let sidx = -1;
			for(let i = 0; i < App.students.length; i++) {
				if(App.students[i].id === qmsg.id) {
					sidx = i;
					break;
				}
			}
			if(sidx >= 0 && this._retUsers.indexOf(qmsg.id) < 0) {
				const qnaRets = this._infos[this._curIdx].qnaRets;
				
				for(let i = 0; i < qmsg.returns.length; i++) {  // 문제별 
					const scriptIdx = qmsg.returns[i];
					if(scriptIdx < qnaRets.length) {
						const users = qnaRets[scriptIdx].users;
						if(users.indexOf(qmsg.id) < 0) users.push(qmsg.id);
						qnaRets[scriptIdx].num = users.length;
					}
				}		
				this._retUsers.push(qmsg.id);
				felsocket.addStudentForStudentReportType6(qmsg.id);
				this._retCnt = this._retUsers.length;
			}
		}
	}

	private _countStart = () => {
		// console.log('_countStart');
	}

	private _countZero = async () => {
		const { actions, inview, view } = this.props;

		this._viewCountDown = false;
		if(view && inview && this._prog === SENDPROG.SENT) {
			await kutil.wait(300);

			if(this._studyDiv === 'READALOUD') {
				this._curSeq = -1;
				const passage = this._infos[this._curIdx].passage;
				this._player.gotoAndPlay(passage.start * 1000, passage.end * 1000, 1);
			} else if(this._studyDiv === 'SHADOWING') {
				const script = this._infos[this._curIdx].scripts[0];
				this._curSeq = script.seq;

				if(this._curSeq >= 0) this._transAt(this._curSeq);
				felsocket.sendPAD($SocketType.MSGTOPAD, {msgtype: 'focusidx',idx: script.seq,});
				this._player.gotoAndPlay(script.audio_start * 1000, script.audio_end * 1000, 1);
			}
		}
	}

	public render() {
		const { inview, data } = this.props;
		const curIdx = this._curIdx;
		const info = this._infos[curIdx];
		const ReadAloudOrShadowing = (this._studyDiv === 'READALOUD' || this._studyDiv === 'SHADOWING');
		return (
			<div className="passage" style={inview ? undefined : style.NONE}>
				<div className="nav">
					<div className="btn_page_box">
						{this._infos.map((item, idx) => <NItem key={idx} on={idx === curIdx} idx={idx} onClick={this._onPage} />)}
					</div>
					<div className="right">
						<div 
							className="return_cnt_box white"
							style={(this._studyDiv === 'QNA' && this._studyProg >= SENDPROG.SENT) ? undefined : style.NONE}
							onClick={this._clickReturn}
						>
							<div>{this._retCnt}/{this._numOfStudent}</div>
						</div>
						<ToggleBtn disabled={ReadAloudOrShadowing} className="btn_trans" onClick={this._clickTrans}/>
						<ToggleBtn disabled={ReadAloudOrShadowing} className="btn_sentence" onClick={this._clickStructure}/>
						<ToggleBtn disabled={ReadAloudOrShadowing} className="btn_img" onClick={this._clickZoom}/>
						<ToggleBtn disabled={ReadAloudOrShadowing} className="btn_audio_drop" on={this._audioOn} onClick={this._onAudio}/>
						{/*
							<ToggleBtn disabled={!this._audioOn} on={this._allOrChoose === 'choose'} className="btn_choose" onClick={this._onChoose}/>
							<ToggleBtn disabled={!this._audioOn} on={this._allOrChoose === 'all'} className="btn_all" onClick={this._onAll}/>
						*/}
					</div>
				</div>
				<audio controls={false} autoPlay={false} ref={this._refAudio}/>
				<div id="script_box" className="script_box">
					<SwiperComponent
						ref={this._refSwiper}
						direction="vertical"
						scrollbar={{ el: '.swiper-scrollbar', draggable: true,}}
						observer={true}
						slidesPerView="auto"
						freeMode={true}						
						noSwiping={this._opt}
						followFinger={true}
						noSwipingClass={'swiper-no-swiping'}
					>
						<div id="script-bnd" className="script-bnd">
							{info.scripts.map((script, idx) => 
									<ScriptItem 
										key={script.seq} 
										curSeq={this._curSeq} 
										script={script}
										retCnt={this._retCnt}
										qnaRet={info.qnaRets[idx]}
										viewReturn={this._studyDiv === 'QNA'}
										onChoose={this._onChoose}
									/>								
							)}
						</div>
					</SwiperComponent>
					<CountDown2 state={this._countdown} view={this._viewCountDown} onStart={this._countStart} onComplete={this._countZero} />
					<Yourturn className="yourturn" view={this._yourturn >= 0} start={this._yourturn >= 0} />
				</div>
				<div className="popup_btns">
					<ToggleBtn 
						className="btn_listen_repeat" 
						disabled={this._prog < SENDPROG.SENT || this._studyDiv === 'READALOUD' || this._studyDiv === 'QNA'} 
						on={this._pass_pop === 'SHADOWING' || this._studyDiv === 'SHADOWING'} 
						onClick={this._onShadowClick}
					/>
					<ToggleBtn 
						className="btn_readalong"
						disabled={this._prog < SENDPROG.SENT || this._studyDiv === 'SHADOWING' || this._studyDiv === 'QNA'} 
						on={this._pass_pop === 'READALOUD' || this._studyDiv === 'READALOUD'} 
						onClick={this._onReadClick}
					/>
					<ToggleBtn 
						className="btn_qna"
						disabled={this._prog < SENDPROG.SENT || this._studyDiv === 'SHADOWING' || this._studyDiv === 'READALOUD'} 
						on={this._pass_pop === 'QNA' || this._studyDiv === 'QNA'} 
						onClick={this._onQAClick}
					/>
				</div>
					<SendUI
						view={inview && this._prog <= SENDPROG.SENDING && !this.props.state.videoPopup}
						type={'teacher'}
						sended={false}
						originY={0}
						onSend={this._onSend}
					/>
					<ImgPassage view={this._zoom} passage={info.passage} onClosed={this._offZoom}/>
					<PassagePopup type={this._pass_pop} view={this._pass_pop !== 'off'} onClosed={this._onPopupClosed} onSend={this._studySend} />
					<TransPopup view={this._trans} scripts={info.scripts} onClosed={this._offTrans} />
					<SentenceStructure view={this._view_structure} data={data.passage} onClosed={this._offStructure}/>
				</div>
		);
	}

	public _getScriptBetweenTime(scripts: IScript[], time: number): IScript {
		const emptyScript: IScript = {
			...scripts[0],
			seq: -1,
		};

		for(let i = 0; i < scripts.length; i++) {
			if(time >= scripts[i].audio_start * 1000 && time <= scripts[i].audio_end * 1000) {
				return scripts[i];
			}
		}
		return emptyScript;
	}
}

export default Passage;


