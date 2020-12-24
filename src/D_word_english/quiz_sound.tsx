import * as React from 'react';
import { observer } from 'mobx-react';

import * as common from './common';
import { App } from '../App';
import { BtnAudio } from '../share/BtnAudio';
import QuizMCBtn from '../share/QuizMCBtn';
import PreInBox from '../share/PreInBox';

import { observable } from 'mobx';
import WrapTextNew from '@common/component/WrapTextNew';

@observer
class QuizSound extends React.Component<common.IQuizPage> {
	@observable private _nPlay = 0;
	@observable private _selected: number = 0;
	@observable private _btnAudioDisabled: boolean = true;

	public componentWillUnmount() {
		this._nPlay = 0;
		this._selected = 0;
	}
	
	public componentDidUpdate(prev: common.IQuizPage) {
		const { view, isTeacher, quizProg, on } = this.props;
		if(on && !prev.on) {
			if(isTeacher) this._selected = 0;
			if(isTeacher && quizProg === 'quiz') {
			    this._nPlay = 2;
			    this._btnAudioDisabled = true;
			} else {
			    this._nPlay = 0;
			    this._btnAudioDisabled = false;
			}	
		} else if(!on && prev.on) {
			this._nPlay = 0;
			if(isTeacher) this._selected = 0;
		}
		if(!view && prev.view) {
			this._selected = 0;
		}
	}

	private _onMc = (num: number) => {
		const { idx, quiz, isTeacher, quizProg, on, onItemChange } = this.props;

		if(!on) return;
		else if(quizProg !== 'quiz') return;

		this._selected = (this._selected === num) ? 0 : num;
		
		if(!isTeacher) {
			quiz.app_result = (this._selected === quiz.quiz_sound.correct);
		}

		if(onItemChange) onItemChange(idx, this._selected + '');
	}

	private _onStop = () => {
		if(this.props.on && this._nPlay > 0 && this.props.quizProg === 'quiz') {
			this._nPlay = 0;
			this._btnAudioDisabled = false;
			this.props.onSoundComplete(this.props.idx);
		}
	}

	public render() {
		const { view, isTeacher, quizProg, hasPreview, percent, quiz }  = this.props;
		const quiz_sound = quiz.quiz_sound;
		const correct = quiz_sound.correct;
		let choices: string[] = [quiz_sound.choice1, quiz_sound.choice2, quiz_sound.choice3, quiz_sound.choice4];
		if(quiz_sound.choice4 === '') choices = [quiz_sound.choice1, quiz_sound.choice2, quiz_sound.choice3];
		
		return (
			<>
				<PreInBox view={isTeacher && quizProg === 'result'}	preClass={hasPreview ? quiz.app_sound : -1}	inClass={percent} top={65} right={110}/>

				<BtnAudio className={'btn_audio' + (isTeacher ? '' : ' ' + quizProg)} url={App.data_url + quiz.audio} nPlay={this._nPlay} onStop={this._onStop} disabled={this._btnAudioDisabled}/>
				<div className={quiz_sound.choice4 === '' ? 'mc-box-three' : 'mc-box'}>{
					choices.map((choice, idx) => {
						let word_style = ' small';
						let quiz_box_style = 'quiz_box';

						if(choice.length <= 10) word_style = ' big';
						else if(choice.length <= 13) word_style = ' middle';

						if(quizProg === 'result') {
							if(quiz_sound.correct === idx + 1) quiz_box_style = 'quiz_box correct';
							if(!isTeacher) {
								if(this._selected === idx + 1) quiz_box_style = 'quiz_box wrong';							
							}
							this._selected = 0;
						}
						if(quiz_sound.choice4 === '') {
							return (
								<div key={idx}>
									<QuizMCBtn key={idx} className={quiz_box_style + word_style} num={idx + 1} on={this._selected === (idx + 1)} onClick={this._onMc} disabled={quizProg !== 'quiz'}>
										<WrapTextNew view={view} lineHeight={120} viewOnInit={true}>
											<span className={word_style}>{choice}</span>
										</WrapTextNew>
									</QuizMCBtn>
								</div>
							);
						} else { 
							return (
								<QuizMCBtn key={idx} className={quiz_box_style + word_style} num={idx + 1} on={this._selected === (idx + 1)} onClick={this._onMc} disabled={quizProg !== 'quiz'}>
									<WrapTextNew view={view} lineHeight={120} viewOnInit={true}>
										<span className={word_style}>{choice}</span>
									</WrapTextNew>
								</QuizMCBtn>
							);
						}
					})
				}
				</div>
			</>
		);
	}
}
export default QuizSound;

