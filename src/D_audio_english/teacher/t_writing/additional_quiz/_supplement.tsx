import * as React from 'react';
import * as _ from 'lodash';
import { observer, PropTypes } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';
import SendUINew from '../../../../share/sendui_new';
import * as common from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';
import TableItem from './table-item';

import { IStateCtx, IActionsCtx, SENDPROG } from '../../t_store';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';
import ProgBox from 'src/D_reading_english/teacher/t_video_box/_prog_box';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBox {
	view: boolean;
	onClosed: () => void;
	onHintClick: () => void;
	data: common.IAdditionalSup[];
}
@observer
class Supplement extends React.Component<IQuizBox> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;	
	@observable private _select = true;
	@observable private _zoom = false;
	@observable private _zoomImgUrl = '';
	@observable private _renderCnt = 0;
	@observable private _prog = SENDPROG.READY;
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
	
	public constructor(props: IQuizBox) {
		super(props);
		
		this._jsx_sentence = _getJSX(props.data[0].directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng); // 문제
		
		const characterImages:Array<string> = ['letstalk_bear.png','letstalk_boy.png','letstalk_gir.png'];
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
		console.log('viewHint')
		this._prog = SENDPROG.COMPLETE
		this._done = 'done'
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

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;
		this._swiper = el.swiper;
	}

	private _refAudio = (btn: BtnAudio) => {
		if(this._btnAudio || !btn) return;
		this._btnAudio = btn;
	}

	private _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}

	private onSend = () =>{
		this._prog = SENDPROG.SENDING
	}

 	public componentDidUpdate(prev: IQuizBox) {
		const { view } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._hint = false;
			this._trans = false;
			this._select = true;
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
	}
	
	public render() {
		const { data ,view} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		return (
			<>
			<div className="additional_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className="subject_rate"></div>
				<ToggleBtn className="btn_answer" on={this._hint} onClick={this._viewAnswer}/>
				<div className="correct_answer_rate"></div>
				<div className="quiz_box">
					<div className={"white_board " + this._done} >
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									{jsx}
									<BtnAudio className={'btn_audio'} url={App.data_url +data[0].main_sound}/>	
								</div>
							</div>
						</div>
						<div className = "table_box">
							{data.map((datasup , idx) =>
								<div key={idx}>
									<TableItem
									viewCorrect={this._prog === SENDPROG.COMPLETE}
									disableSelect={this._prog === SENDPROG.COMPLETE}
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
			<SendUINew
					view={view}
					type={'teacher'}
					sended={false}
					originY={0}
					onSend={this.onSend}
				/>
			</>
		);
	}
}

export default Supplement;