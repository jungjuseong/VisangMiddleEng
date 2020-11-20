import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import * as butil from '@common/component/butil';

import * as common from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBox {
	view: boolean;
	onClosed: () => void;
	onHintClick: () => void;
	data: common.IAdditionalBasic[];
}
@observer
class Basic extends React.Component<IQuizBox> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;
	@observable private _select = true;
	@observable private _zoom = false;
	@observable private _zoomImgUrl = '';
	
	private _swiper?: Swiper;

	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _jsx_question1: string;
	private _jsx_question1_answer1: string;
	private _jsx_question1_answer2: string;
	private _jsx_question1_answer3: string;
	private _jsx_question2: string;
	private _jsx_question2_answer1: string;
	private _jsx_question2_answer2: string;
	private _jsx_question2_answer3: string;
	private _jsx_question3: string;
	private _jsx_question3_answer1: string;
	private _jsx_question3_answer2: string;
	private _jsx_question3_answer3: string;

	private _characterImage: string;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBox) {
		super(props);
		
		this._jsx_sentence = _getJSX(props.data[0].directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data[0].directive.eng); // 문제

		this._jsx_question1= props.data[0].sentence;
		this._jsx_question1_answer1= props.data[0].sentence_answer1;
		this._jsx_question1_answer2= props.data[0].sentence_answer2;
		this._jsx_question1_answer3= props.data[0].sentence_answer3;
		this._jsx_question2= props.data[1].sentence;
		this._jsx_question2_answer1= props.data[1].sentence_answer1;
		this._jsx_question2_answer2= props.data[1].sentence_answer2;
		this._jsx_question2_answer3= props.data[1].sentence_answer3;
		this._jsx_question3= props.data[2].sentence;
		this._jsx_question3_answer1= props.data[2].sentence_answer1;
		this._jsx_question3_answer2= props.data[2].sentence_answer2;
		this._jsx_question3_answer3= props.data[2].sentence_answer3;
		
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
	// True / False 토글 기능
	private _selectedValue = () => {
		App.pub_playBtnTab();
		this._select = !this._select;
		if(this._select) this._select = true;

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

	// 답 확인 토글 기능 answer
	private _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		console.log('viewHint')
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
		const { data, } = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		return (
			<>
			<div className="additional_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className="subject_rate"></div>
				<ToggleBtn className="correct_answer" on={this._hint} onClick={this._viewAnswer}/>
				<div className="correct_answer_rate"></div>
				<div className="quiz_box">
					<div className="white_board">
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									{jsx}
									<BtnAudio className={'btn_audio'} url={App.data_url +data[0].main_sound}/>	
								</div>
							</div>
						</div>
						<div className = "basic_question">
							<div>
								<p>1.{_getJSX(this._jsx_question1)}</p>
								<div>
									<div className="answer_box" style={{ borderBottom: this._jsx_question1_answer1 != '' ? '' : 'none' }}>
										<div className={'sample' + (this._hint ? ' hide' : '')}/>
										<div className={'hint' + (this._hint ? '' : ' hide')}>
											{this._jsx_question1_answer1}
										</div>
									</div>
									<div className="answer_box" style={{ borderBottom: this._jsx_question1_answer2 != '' ? '' : 'none' }}>
										<div className={'sample' + (this._hint ? ' hide' : '')}/>
										<div className={'hint' + (this._hint ? '' : ' hide')}>
											{this._jsx_question1_answer2}
										</div>
									</div>
									<div className="answer_box" style={{ borderBottom: this._jsx_question1_answer3 != '' ? '' : 'none' }}>
										<div className={'sample' + (this._hint ? ' hide' : '')}/>
										<div className={'hint' + (this._hint ? '' : ' hide')}>
											{this._jsx_question1_answer3}
										</div>
									</div>
								</div>
							</div>
							<div>
								<p>2.{_getJSX(this._jsx_question2)}</p>
								<div>
									<div className="answer_box" style={{ borderBottom: this._jsx_question2_answer1 != '' ? '' : 'none' }}>
										<div className={'sample' + (this._hint ? ' hide' : '')}/>
										<div className={'hint' + (this._hint ? '' : ' hide')}>
											{this._jsx_question2_answer1}
										</div>
									</div>
									<div className="answer_box" style={{ borderBottom: this._jsx_question2_answer2 != '' ? '' : 'none' }}>
										<div className={'sample' + (this._hint ? ' hide' : '')}/>
										<div className={'hint' + (this._hint ? '' : ' hide')}>
											{this._jsx_question2_answer2}
										</div>
									</div>
									<div className="answer_box" style={{ borderBottom: this._jsx_question2_answer3 != '' ? '' : 'none' }}>
										<div className={'sample' + (this._hint ? ' hide' : '')}/>
										<div className={'hint' + (this._hint ? '' : ' hide')}>
											{this._jsx_question2_answer3}
										</div>
									</div>
								</div>
							</div>
							<div>
								<p>3. {_getJSX(this._jsx_question3)}</p>
								<div>
									<div className="answer_box" style={{ borderBottom: this._jsx_question3_answer1 != '' ? '' : 'none' }}>
										<div className={'sample' + (this._hint ? ' hide' : '')}/>
										<div className={'hint' + (this._hint ? '' : ' hide')}>
											{this._jsx_question3_answer1}
										</div>
									</div>
									<div className="answer_box" style={{ borderBottom: this._jsx_question3_answer2 != '' ? '' : 'none' }}>
										<div className={'sample' + (this._hint ? ' hide' : '')}/>
										<div className={'hint' + (this._hint ? '' : ' hide')}>
											{this._jsx_question3_answer2}
										</div>
									</div>
									<div className="answer_box" style={{ borderBottom: this._jsx_question3_answer3 != '' ? '' : 'none' }}>
										<div className={'sample' + (this._hint ? ' hide' : '')}/>
										<div className={'hint' + (this._hint ? '' : ' hide')}>
											{this._jsx_question3_answer3}
										</div>
									</div>
								</div>
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