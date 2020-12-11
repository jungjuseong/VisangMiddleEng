import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';
import { IAdditionalSup } from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';
import TableItem from './table-item';
import { CorrectBar } from '../../../../share/Progress_bar';

import { IStateCtx, IActionsCtx, SENDPROG } from '../../t_store';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBoxProps {
	view: boolean;
	actions: IActionsCtx;
	state: IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	data: IAdditionalSup[];
}
@observer
class SupplementQuizBox extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;	
	@observable private _renderCnt = 0;
	@observable private _prog = SENDPROG.READY;
	@observable private _sended = false;
	private _swiper?: Swiper;

	private readonly _soption: SwiperOptions = {
		direction: 'vertical',
		observer: true,
		slidesPerView: 'auto',
		freeMode: true,
		mousewheel: true,			
		noSwiping: false,
		followFinger: true,
		scrollbar: {el: '.swiper-scrollbar',draggable: true, hide: false},	
	};

	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _characterImage: string;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBoxProps) {
		super(props);
		
		this._jsx_sentence = _getJSX(props.data[0].directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng); // 문제
		
		const characterImages: string[] = ['letstalk_bear.png','letstalk_boy.png','letstalk_gir.png'];
		const pathPrefix = `${_project_}/teacher/images/`;

		const randomIndex = Math.floor(Math.random() * 3);
		this._characterImage = pathPrefix + characterImages[randomIndex];
	}
	// Translation 토글 기능
	private _viewTrans = () => {
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
	
	private _done: string = '';
	// 답 확인 토글 기능 answer
	private _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		console.log('viewHint');
		this._prog = SENDPROG.COMPLETE;
		this._done = 'done';
		this.props.onHintClick();
		this._hint = !this._hint;

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

	private _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}

 	public componentDidUpdate(prev: IQuizBoxProps) {
		const { view ,state} = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._hint = false;
			this._trans = false;

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

		} else if(!view && prev.view) {
			this._view = false;	
			App.pub_stop();
		}

		if(state.additionalSupProg >= SENDPROG.SENDED) {
			this._sended = true;
		}
	}
	
	public render() {
		const { data ,view,state} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		let qResult = -1;
		const isQComplete = state.additionalSupProg >= SENDPROG.COMPLETE;
		if(isQComplete) {
			if(state.numOfStudent > 0) qResult = Math.round(100 * state.resultAdditionalSup.arrayOfCorrect.filter((it) => it === true).length / state.numOfStudent);
			else qResult = 0;
			if(qResult > 100) qResult = 100;
		}
		return (
			<>
			<div className="additional_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + (this._sended ? '' : ' hide')}>{state.resultAdditionalSup.uid.length}/{App.students.length}</div>
				<ToggleBtn className={'btn_answer' + (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				<CorrectBar 
					className={'correct_answer_rate' + (this._sended ? '' : ' hide')} 
					preview={-1} 
					result={qResult}
				/>
				<div className="quiz_box">
					<div className={'white_board ' + this._done} >
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									{jsx}
									<BtnAudio className={'btn_audio'} url={App.data_url + data[0].main_sound}/>	
								</div>
							</div>
						</div>
						<div className="table_box">
							{data.map((datasup , idx) =>
								<div key={idx}>
									<TableItem
										viewCorrect={this._prog === SENDPROG.COMPLETE}
										disableSelect={this._prog === SENDPROG.COMPLETE}
										viewResult={this._prog === SENDPROG.COMPLETE}
										inview={view}
										graphic={datasup}
										className="type_3"
										maxWidth={1000}
										renderCnt={this._renderCnt}
										optionBoxPosition="bottom"
										viewBtn={false}
										idx={idx}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default SupplementQuizBox;