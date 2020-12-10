import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import * as butil from '@common/component/butil';

import { SENDPROG, IStateCtx, IActionsCtx } from '../../t_store';
import * as common from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';
import { CorrectBar } from '../../../../share/Progress_bar';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBox {
	view: boolean;
	actions: IActionsCtx;
	state:IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	data: common.IAdditionalHard[];
}
@observer
class Hard extends React.Component<IQuizBox> {
	@observable private _view = false;
	@observable private _hint = false;
	@observable private _trans = false;
	@observable private _sended = false;
	
	private _swiper?: Swiper;

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

		if(state.additionalHardProg >= SENDPROG.SENDED){
			this._sended = true;
		}
	}
	
	public render() {
		const { data, state} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		let qResult = -1;
        const isQComplete = state.additionalHardProg >= SENDPROG.COMPLETE;
        if(isQComplete) {
            if(state.numOfStudent > 0) qResult = Math.round(100 * state.resultAdditionalHard.arrayOfCorrect.filter(it=>it===true).length / state.numOfStudent);
            else qResult = 0;
            if(qResult > 100) qResult = 100;
        }
		return (
			<>
			<div className="additional_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={"subject_rate"+ (this._sended ? '' : ' hide')}>{state.resultAdditionalHard.uid.length}/{App.students.length}</div>
				<ToggleBtn className={"btn_answer"+ (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				<CorrectBar 
					className={'correct_answer_rate'+ (this._sended ? '' : ' hide')} 
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
									<BtnAudio className={'btn_audio'} url={App.data_url +data[0].main_sound}/>											
								</div>
							</div>
						</div>
						<div className = "hard_question">
							{data.map((question, idx) =>{
								return <div key={idx}>
									<p className="number">{idx + 1}.</p>
									<p>{_getJSX(question.sentence)}</p>
									<div className="answer_bundle">
										<div className="answer_box">
											<div className={'sample' + (this._hint ? ' hide' : '')}/>
											<div className={'hint' + (this._hint ? '' : ' hide')}>
												{question.sentence1.answer1}
											</div>
										</div>
										{' → '}
										<div className="answer_box">
											<div className={'sample' + (this._hint ? ' hide' : '')}/>
											<div className={'hint' + (this._hint ? '' : ' hide')}>
												{question.sentence1.answer2}
											</div>
										</div>
									</div>
								</div>
							})}
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default Hard;