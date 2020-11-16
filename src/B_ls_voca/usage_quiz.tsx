import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import * as butil from '@common/component/butil';
import * as kutil from '@common/util/kutil';
import { IQuizPage } from './common';
import { App } from '../App';
import PreInBox from '../share/PreInBox';

import QuizMCBtn from '../share/QuizMCBtn';
import WrapTextNew from '@common/component/WrapTextNew';

function findLongestWord(words: Array<string>) {
	let longestWord = '';
  
	words.forEach(word => {
	  if(word.length > longestWord.length) {
		longestWord = word;
	  }
	});  
	return longestWord;
}

@observer
class UsageQuiz extends React.Component<IQuizPage> {
	@observable private _selected: number = 0;
	@observable private _rcalcNum = 0;
	private _jsx: JSX.Element;
	private _div?: HTMLElement;

	constructor(props: IQuizPage) {
		super(props);

		const { choices, sentence} = props.quiz.quiz_usage;
		const longestWord = findLongestWord(choices);
		this._jsx = this._getJSX(sentence, longestWord);
	}

	private _getJSX(text: string, max: string) {
		const nodes = butil.parseBlock(text, 'block', max);
		return (
			<>
				{nodes.map((node) => node)}
			</>
		);
	}

	private async _soundComplete() {
		if(this.props.idx > 0) await kutil.wait(300);
		if(this.props.on) this.props.onSoundComplete(this.props.idx);
	}

	public componentWillUnmount() {
		this._selected = 0;
		this._setBlock(0, false);
	}

	public componentDidUpdate(prev: IQuizPage) {
		const { on, view, quiz, isTeacher,quizProg } = this.props;
		if(on && !prev.on) {
			if(isTeacher) this._selected = 0;

			this._soundComplete();
			
		} else if(!on && prev.on) {
			if(isTeacher) this._selected = 0;
		}
		
		if(view && !prev.view || !view && prev.view) {
			this._rcalcNum = 0;
			this._selected = 0;
			this._setBlock(0, false);
		}

		if(view && quizProg === 'result' && prev.quizProg !== 'result') {
			this._setBlock(quiz.quiz_usage.correct, false);
		}
	}

	private _onMc = (num: number) => {
		const { on,idx, quiz,onItemChange, isTeacher,quizProg } = this.props;

		if(!on || quizProg !== 'quiz') return;

		this._selected = (this._selected === num) ? 0 : num;

		if(!isTeacher) {
			quiz.app_result = (this._selected === quiz.quiz_usage.correct);
		}

		this._setBlock(this._selected, true);

		if(onItemChange) onItemChange(idx, this._selected + '');
	}

	private _refSentence = (div: HTMLDivElement) => {
		if(!div) return;

		this._div = div;
	}

	private _setBlock = (num: number, bView: boolean) => {
		const { quiz } = this.props;
		if(!this._div) return;

		let block = this._div.querySelector('.block');
		if(!block) return;

		if(num < 1 || num > 3) {
			num = quiz.quiz_usage.correct;
			bView = false;
		}

		let choice: string|undefined;
		if(num === 1) choice = quiz.quiz_usage.choices[0];
		else if(num === 2) choice = quiz.quiz_usage.choices[1];
		else choice = quiz.quiz_usage.choices[2];		

		if(bView && !block.classList.contains('view')) block.classList.add('view');
		else if(!bView && block.classList.contains('view')) block.classList.remove('view');

		block.innerHTML = choice;
		this._rcalcNum++;
	}	

	public render() {
		const { view, quiz, isTeacher, quizProg, hasPreview, percent }  = this.props;
		const { correct, choices } = quiz.quiz_usage;

		return (
			<>
				<PreInBox view={isTeacher && quizProg === 'result'}	preClass={hasPreview ? quiz.app_sentence : -1} inClass={percent} top={150} right={140}/>

				<div className="img_box">
					{/*<CorrectBar className={p_type + ' sentence'}/>*/}
					<img src={App.data_url + quiz.quiz_usage.image} draggable={false} />
					<div className={'quiz_usage' + (quizProg === 'result' ? ' result' : '')}><div ref={this._refSentence}>
						<WrapTextNew view={view} maxSize={48} minSize={44} lineHeight={130} rcalcNum={this._rcalcNum} viewWhenInit={true}>{this._jsx}
						</WrapTextNew>
					</div></div>
				</div>
				<div className="usage">{choices.map((choice, idx) => {
					const arr: string[] = ['quiz_box'];
					let selected = this._selected;

					let wordClass;
					if(choice.length <= 13) wordClass = ' big';
					else wordClass = ' small';

					if(quizProg === 'result') {
						if(isTeacher) {
							if(correct === idx + 1) arr.push('correct');
							selected = 0;
						} else {
							if(correct === idx + 1) arr.push('correct');
							else if(selected === idx + 1) arr.push('wrong');
							selected = 0;
							/* 정답일 경우 선태 모양 유지
							if(correct === selected) {
								selected = this._selected;
								// if(correct === idx + 1) arr.push('correct');
							} else {
								if(correct === idx + 1) arr.push('correct');
								if(selected === idx + 1) arr.push('wrong');
								selected = 0;
							} 
							*/
						}
					}
					return (
						<QuizMCBtn key={idx} className={arr.join(' ') + wordClass} num={idx + 1} on={selected === (idx + 1)} onClick={this._onMc} disabled={quizProg !== 'quiz'}>
							<WrapTextNew view={view} /*maxSize={36} minSize={36}*/ lineHeight={110} viewWhenInit={true}>{choice}</WrapTextNew>
						</QuizMCBtn>
					);
				})}</div>
			</>
		);
	}
}

export default UsageQuiz;

