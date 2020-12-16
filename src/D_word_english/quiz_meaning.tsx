import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { IQuizPage } from './common';
import { App } from '../App';
import { BtnAudio } from '../share/BtnAudio';
import QuizMCBtn from '../share/QuizMCBtn';

import PreInBox from '../share/PreInBox';

@observer
class QuizMeaning extends React.Component<IQuizPage> {
	@observable private _nPlay = 0;
	@observable private _selected: number = 0;
	@observable private _btnAudioDisabled: boolean = true;

	public componentWillUnmount() {
		this._btnAudioDisabled = true;
		this._nPlay = 0;
		this._selected = 0;
	}

	public componentDidUpdate(prev: IQuizPage) {
		const { isTeacher, quizProg, view, on } = this.props;
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
		const { isTeacher, quiz, quizProg, idx, on, onItemChange } = this.props;
		if(!on) return;
		else if(quizProg !== 'quiz') return;

		this._selected = (this._selected === num) ? 0 : num;

		if(!isTeacher) {
			quiz.app_result = (this._selected === quiz.quiz_meaning.correct);
		}
		if(onItemChange) onItemChange(idx, this._selected + '');
	}

	private _onStop = () => {
		const { onSoundComplete, quizProg, idx, on, onItemChange } = this.props;
		if(on && this._nPlay > 0 && quizProg === 'quiz') {
			this._nPlay = 0;
			this._btnAudioDisabled = false;
			onSoundComplete(idx);
			console.log('end?, click ok');
		}
	}
	public render() {
		const { quiz, isTeacher, quizProg, hasPreview, percent }  = this.props;
		const quiz_meaning = quiz.quiz_meaning;
		const correct = quiz_meaning.correct;
		const choices: string[] = [quiz_meaning.choice1, quiz_meaning.choice2, quiz_meaning.choice3];

		return (
			<>
				<PreInBox
					view={isTeacher && quizProg === 'result'}
					preClass={hasPreview ? quiz.app_meaning : -1}
					inClass={percent}
					top={65}
					right={110}
				/>
				<BtnAudio className={'btn_audio' + (isTeacher ? '' : ' ' + quizProg)} url={App.data_url + quiz.audio} nPlay={this._nPlay} onStop={this._onStop} disabled={this._btnAudioDisabled}/>
				<div className="word">{quiz.entry}</div>
				<div className="mean">{
					choices.map((choice, idx) => {
						const arr: string[] = ['quiz_box'];
						let selected = this._selected;
						if(quizProg === 'result') {
							if(isTeacher) {
								if(correct === idx + 1) arr.push('correct');
							} else {
								if(correct === idx + 1) arr.push('correct');
								else if(selected === idx + 1) arr.push('wrong');
							}
							selected = 0;
						}
						return (
							<QuizMCBtn key={idx} className={arr.join(' ')} num={idx + 1} on={selected === (idx + 1)} onClick={this._onMc} disabled={quizProg !== 'quiz'}>
								{choice}
							</QuizMCBtn>
						);
				})}</div>
			</>
		);
	}
}
export default QuizMeaning;


