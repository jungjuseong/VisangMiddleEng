import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import { CorrectBar } from '../../../../share/Progress_bar';

import { SENDPROG, IStateCtx, IActionsCtx } from '../../t_store';
import * as common from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBoxProps {
	view: boolean;
	actions: IActionsCtx;
	state: IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	data: common.IConfirmNomal;
}
@observer
class Basic extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;
	@observable private _zoom = false;
	@observable private _zoomImgUrl = '';
	@observable private _sended = false;
	
	private _swiper?: Swiper;

	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _jsx_hint1: number;
	private _jsx_hint2: number;
	private _jsx_hint3: number;
	private _characterImage: string;
	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBoxProps) {
		super(props);
		
		const { directive, item1, item2, item3 } = props.data;
		this._jsx_sentence = _getJSX(directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(directive.eng); // 문제
		this._jsx_hint1 = item1.answer; // 답
		this._jsx_hint2 = item2.answer; // 답
		this._jsx_hint3 = item3.answer; // 답

		const characterImages:Array<string> = ['letstalk_bear.png','letstalk_boy.png','letstalk_gir.png'];
		const pathPrefix = `${_project_}/teacher/images/`;

		const randomIndex = Math.floor(Math.random() * 3);
		this._characterImage = pathPrefix + characterImages[randomIndex];
	}

	private _viewTranslation = () => {
		App.pub_playBtnTab();
		this._trans = !this._trans;
		if(this._trans) this._trans = true;

		if(this._swiper) {
			this._swiper.slideTo(0, 0);
			this._swiper.update();
			if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
		}
		_.delay(() => {
			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
			}				
		}, 300);
	}

	@action
	private _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		if(!this._hint){
			this.props.onHintClick();
			this._hint = true;

			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
			}
			_.delay(() => {
				if(this._swiper) {
					this._swiper.slideTo(0, 0);
					this._swiper.update();
					if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
				}				
			}, 300);
		}
	}

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;
		this._swiper = el.swiper;
	}

	private _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}

 	public componentDidUpdate(prev: IQuizBoxProps) {
		const { view , state } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._trans = false;
			this._zoom = false;
			this._zoomImgUrl = '';

			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
			}
			_.delay(() => {
				if(this._swiper) {
					this._swiper.slideTo(0, 0);
					this._swiper.update();
					if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
				}				
			}, 300);

		} else if(!this.props.view && prev.view) {
			this._view = false;	
			this._zoom = false;
			this._zoomImgUrl = '';
			App.pub_stop();
		}
		if(state.confirmBasicProg >= SENDPROG.SENDED){
			this._sended = true;
		}
	}
	
	public render() {
		const { item1, item2, item3 } = this.props.data;
		const {state} = this.props
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		let qResult = -1;
        const isQComplete = state.confirmBasicProg >= SENDPROG.COMPLETE;
        if(isQComplete) {
            if(state.numOfStudent > 0) qResult = Math.round(100 * state.resultConfirmBasic.arrayOfCorrect.filter(it=>it === true).length / state.numOfStudent);
            else qResult = 0;
            if(qResult > 100) qResult = 100;
        }
		return (
			<>
			<div className="confirm_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={"subject_rate" + (this._sended ? '' : ' hide')}>{this.props.state.resultConfirmBasic.uid.length}/{App.students.length}</div>
				<CorrectBar 
					className={'correct_answer_rate' + (this._sended ? '' : ' hide')} 
					preview={-1} 
					result={qResult}
				/>
				<ToggleBtn className={"btn_answer" + (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				<div className="quiz_box">
					<div className="white_board basic">
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTranslation}/>
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									{jsx}
									<BtnAudio className={'btn_audio'} url={App.data_url + this.props.data.main_sound}/>	
								</div>
							</div>
						</div>
						<div className="image_box">
							<img src={App.data_url + item1.img} draggable={false}/>
							<img src={App.data_url + item2.img} draggable={false}/>
							<img src={App.data_url + item3.img} draggable={false}/>
						</div>	
					</div>
					<div className="speechbubble_box" >
						<div className={(this._hint ? ' view-hint' : '')}>
							<div className={'sample' + (this._hint ? ' hide' : '')}/>
							<div className={'hint' + (this._hint ? '' : ' hide')}>
								{this._jsx_hint1},{this._jsx_hint2},{this._jsx_hint3}
							</div>
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default Basic;