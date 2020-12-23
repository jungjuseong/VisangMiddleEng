import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer } from 'mobx-react';

import { IStateCtx, IActionsCtx, QnaProg } from '../s_store';
import { IScript,IQNAMsg } from '../../common';
import { observable } from 'mobx';
import { ToggleBtn } from '@common/component/button';
import * as kutil from '@common/util/kutil';

import SendUI from '../../../share/sendui_new';
import * as style from '../../../share/style';
import * as _ from 'lodash';
import { App } from '../../../App';
import * as felsocket from '../../../felsocket';
import SScript from './s_script';

const SwiperComponent = require('react-id-swiper').default;

interface ISPassageProps {
	view: boolean;
	viewTrans: boolean;
	focusSeq: number;
	qnaProg: QnaProg;
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class SPassage extends React.Component<ISPassageProps> {
	@observable private _swiper: Swiper|null = null;
	@observable private _img_pop_on = false;
	@observable private _selected: number[] = [];

	private _scripts: IScript[] = [];

    private _stime = 0;

	private _clickYes = () => {
		const { state } = this.props;

		if(this._stime === 0) this._stime = Date.now();
		if(state.qnaProg !== QnaProg.YESORNO) return;

		App.pub_playBtnTab();
		state.qnaProg = QnaProg.SELECTING;

		this._img_pop_on = true;
		_.delay(() => {
			this._img_pop_on = false;
		}, 2000); // 시간 수정
	}

	private _clickNo = async () => {
		const {state,actions} = this.props;

		if(this._stime === 0) this._stime = Date.now();
		if(state.qnaProg === QnaProg.YESORNO) {
			App.pub_playBtnTab();
			state.qnaProg = QnaProg.SENDED;
			if(App.student) {
				const passage = actions.getData().passage[state.passageidx];

				felsocket.sendTeacher($SocketType.MSGTOTEACHER, {
					msgtype: 'qna_return',
					id: App.student.id,
					returns: [],
					stime: this._stime,
					etime: Date.now(),
					seq: passage.page,
				});
				await kutil.wait(300);
				App.pub_playGoodjob();
				actions.startGoodJob(); // 추가
			}
		}
	}

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;
		this._swiper = el.swiper;
	}

	private _onSend = async () => {
		const {state, actions} = this.props;
		if(App.student && state.qnaProg === QnaProg.SELECTING) {

			state.qnaProg = QnaProg.SENDING;
			App.pub_playToPad();
			const passage = actions.getData().passage[state.passageidx];
			felsocket.sendTeacher($SocketType.MSGTOTEACHER, {
				msgtype: 'qna_return',
				id: App.student.id,
				returns: this._selected.slice(0),
				stime: this._stime,
				etime: Date.now(),
				seq: passage.page,
			});
			await kutil.wait(600);
			if(state.qnaProg === QnaProg.SENDING) {
				state.qnaProg = QnaProg.SENDED;
				App.pub_playGoodjob();
				this.props.actions.startGoodJob();
			}	
		}	
	}

	public componentWillReceiveProps(next: ISPassageProps) {
		if(next.view && !this.props.view) {
			const data = next.actions.getData();
			const passage = data.passage[next.state.passageidx];
			while(this._scripts.length > 0) this._scripts.pop();
			for(let i = 0; i < data.scripts.length; i++ ) {
				if(data.scripts[i].passage_page === passage.page) this._scripts.push(data.scripts[i]);
			}
		}
	}

	private async _updateSwiper() {
		await kutil.wait(100);
		if(this._swiper) {
			this._swiper.update();
			if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();

			this._swiper.slideTo(0);
		}
	}

	public componentDidUpdate(prev: ISPassageProps) {
		const { view, viewTrans, focusSeq, qnaProg } = this.props;

		if(view && !prev.view) {
			this._img_pop_on = false;
			this._updateSwiper();
			this._stime = 0;
		}
		if(viewTrans !== prev.viewTrans) this._updateSwiper();
		
		if(qnaProg !== prev.qnaProg) {
			if(qnaProg === QnaProg.UNMOUNT || qnaProg === QnaProg.YESORNO) {
				while(this._selected.length > 0) this._selected.pop();
			}
		}
		if(focusSeq >= 0 && focusSeq !== prev.focusSeq) {
			if(this._swiper) {
				let sidx = -1;
				for(let i = 0; i < this._scripts.length; i++) {
					if(this._scripts[i].seq === focusSeq) {
						sidx = i;
						break;
					}
				}

				if(sidx >= 1) this._swiper.slideTo(sidx - 1);
				else if(sidx >= 0) this._swiper.slideTo(0);
			}
		}
	}

	private _scriptClick = (script: IScript, idx: number) => {
		if(this.props.qnaProg === QnaProg.SELECTING) {
			if(this._selected.indexOf(idx) < 0) this._selected.push(idx);
			else this._selected.splice(this._selected.indexOf(idx), 1);
		}
	}

	public render() {
		const { view,  state, actions, viewTrans, qnaProg} = this.props;

		const data = actions.getData();

		return (
			<div className="s_passage" style={view ? undefined : style.HIDE}>
				<div className="passage_page">
					<span>{state.passageidx + 1}/{data.passage.length}</span>
				</div>
				<div className={'page ' + (state.isPlay ? 'swiper-no-swiping' : '')}>
					<SwiperComponent
						ref={this._refSwiper}
						direction="vertical"
						scrollbar={{ el: '.swiper-scrollbar', draggable: true,}}
						observer={true}
						slidesPerView="auto"
						freeMode={true}						
					>
					{this._scripts.map((script, idx) => 
						<div key={idx} className="script">
							<SScript 
								idx={idx}
								viewTrans={viewTrans} 
								qnaProg={qnaProg}
								focusSeq={state.focusSeq}
								viewSctiprFocusBG={state.viewSctiprFocusBG}
								selected={this._selected.indexOf(idx) >= 0}
								script={script}
								onClick={this._scriptClick}
							/>
						</div>
					)}	
					</SwiperComponent>
				</div>
				<div className={'img_pop' + (this._img_pop_on ? ' on' : '')} />
				<div className={'btn_box' + (qnaProg === QnaProg.YESORNO ? ' on' : '')}>
					<ToggleBtn className="btn_yes" onClick={this._clickYes} on={qnaProg === QnaProg.SELECTING}/>
					<ToggleBtn className="btn_no" onClick={this._clickNo} on={qnaProg === QnaProg.SENDED}/>
				</div>
				<SendUI
					view={(qnaProg === QnaProg.SELECTING || qnaProg === QnaProg.SENDING) && this._selected.length > 0}
					type={'pad'}
					originY={0}
					sended={false}
					onSend={this._onSend}
				/>
			</div>
		);
	}
}
export default SPassage;


