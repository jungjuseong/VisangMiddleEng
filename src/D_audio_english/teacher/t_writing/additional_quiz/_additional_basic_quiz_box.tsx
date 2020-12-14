import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import { SENDPROG } from '../../t_store';
import { CorrectBar } from '../../../../share/Progress_bar';
import { BtnAudio } from '../../../../share/BtnAudio';
import { IAdditionalBasic } from '../../../common';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

import QuizBox, { IQuizBoxProps } from './_additional_quiz_box';

@observer
class BasicQuizBox extends QuizBox {

	public render() {
		const { data, state} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_kor_sentence;
		let qResult = -1;
		const basic_data = (data as IAdditionalBasic[]);

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
							{basic_data.map((q, idx) => {
								const answers = [q.sentence_answer1, q.sentence_answer2, q.sentence_answer3];
								return <div key={idx}>
									<div>
										<p className="number">{idx + 1}.</p>
										<p>{_getJSX(q.sentence)}</p>
									</div>
									<div>
										{
											answers.map((answer, key) => (
												<div key={key} className="answer_box" style={{ borderBottom: q.sentence_answer2 !== '' ? '' : 'none' }}>
													<div className={'sample' + (this._hint ? ' hide' : '')}/>
													<div className={'hint' + (this._hint ? '' : ' hide')}>
														{answer}
													</div>
												</div>
											))
										}
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