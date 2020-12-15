import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import { SENDPROG } from '../../t_store';
import { IAdditionalHard } from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';
import { CorrectBar } from '../../../../share/Progress_bar';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';
import QuizBox, { IQuizBoxProps } from './_additional_quiz_box';

@observer
class HardQuizBox extends QuizBox {

	public render() {
		const { data, state} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_kor_sentence;
		let qResult = -1;
		const hard_data = data as IAdditionalHard[];

		if(state.additionalHardProg >= SENDPROG.COMPLETE) {
			if(state.numOfStudent > 0) qResult = Math.round(100 * state.resultAdditionalHard.arrayOfCorrect.filter((it) => it === true).length / state.numOfStudent);
			else qResult = 0;
			if(qResult > 100) qResult = 100;
		}
		return (
			<>
			<div className="additional_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + (this._sended ? '' : ' hide')}>{state.resultAdditionalHard.uid.length}/{App.students.length}</div>
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
						<div className="hard_question">
							{hard_data.map((question, idx) => {
								return (<div key={idx}>
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
								</div>);
							})}
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default HardQuizBox;