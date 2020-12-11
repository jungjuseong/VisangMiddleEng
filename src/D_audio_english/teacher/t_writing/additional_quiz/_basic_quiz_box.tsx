import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import { IStateCtx, IActionsCtx, SENDPROG } from '../../t_store';
import { CorrectBar } from '../../../../share/Progress_bar';

import { IAdditionalBasic } from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

interface IQuizBoxProps {
	view: boolean;
	actions: IActionsCtx;
	state: IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	data: IAdditionalBasic[];
}
@observer
class BasicQuizBox extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;
	@observable private _sended = false;
	
	private _swiper?: Swiper;

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

	// 답 확인 토글 기능 answer
	private _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		console.log('viewHint');
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
		const { view ,state } = this.props;
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

		} else if(!this.props.view && prev.view) {
			this._view = false;	
			App.pub_stop();
		}

		if(state.additionalBasicProg >= SENDPROG.SENDED) this._sended = true;
	}
	
	public render() {
		const { data, state} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		let qResult = -1;

		if(state.additionalBasicProg >= SENDPROG.COMPLETE) {
			if(state.numOfStudent > 0) qResult = Math.round(100 * state.resultAdditionalBasic.arrayOfCorrect.filter((it) => it === true).length / state.numOfStudent);
			else qResult = 0;
			if(qResult > 100) qResult = 100;
		}
		
		return (
			<>
			<div className="additional_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + (this._sended ? '' : ' hide')}>{state.resultAdditionalBasic.uid.length}/{App.students.length}</div>
				<ToggleBtn className={'btn_answer' + (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				<CorrectBar 
					className={'correct_answer_rate' + (this._sended ? '' : ' hide')} 
					preview={-1} 
					result={qResult}
				/>
				<div className="quiz_box">
					<div className="white_board">
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									{jsx}
									<BtnAudio className={'btn_audio'} url={App.data_url + data[0].main_sound}/>	
								</div>
							</div>
						</div>
						<div className="basic_question">
							{data.map((question, idx) => {
								return <div key={idx}>
									<div>
										<p className="number">{idx + 1}.</p>
										<p>{_getJSX(question.sentence)}</p>
									</div>
									<div>
										<div className="answer_box" style={{ borderBottom: question.sentence_answer1 !== '' ? '' : 'none',  }}>
											<div className={'sample' + (this._hint ? ' hide' : '')}/>
											<div className={'hint' + (this._hint ? '' : ' hide')}>
												{question.sentence_answer1}
											</div>
										</div>
										<div className="answer_box" style={{ borderBottom: question.sentence_answer2 !== '' ? '' : 'none' }}>
											<div className={'sample' + (this._hint ? ' hide' : '')}/>
											<div className={'hint' + (this._hint ? '' : ' hide')}>
												{question.sentence_answer2}
											</div>
										</div>
										<div className="answer_box" style={{ borderBottom: question.sentence_answer3 !== '' ? '' : 'none' }}>
											<div className={'sample' + (this._hint ? ' hide' : '')}/>
											<div className={'hint' + (this._hint ? '' : ' hide')}>
												{question.sentence_answer3}
											</div>
										</div>
									</div>
								</div>;
							})}
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default BasicQuizBox;