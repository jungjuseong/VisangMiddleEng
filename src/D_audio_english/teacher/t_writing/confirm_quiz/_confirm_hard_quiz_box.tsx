import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import * as butil from '@common/component/butil';

import { IConfirmHard,IProblemHard } from '../../../common';
import { BtnAudio } from '../../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';
import ConfirmQuizBox, { IConfirmQuizBoxProps } from './_confirm_quiz_box';

@observer
class ConfirmHardQuizBox extends ConfirmQuizBox {

	private _jsx_questions: IProblemHard[] = [];
	
	public constructor(props: IConfirmQuizBoxProps) {
		super(props);

		const hard_data = props.data as IConfirmHard;
		this._jsx_questions.push(hard_data.problem1);
		this._jsx_questions.push(hard_data.problem1);
		this._jsx_questions.push(hard_data.problem1);
	}
	
	public render() {
		const { data, state} = this.props;
		let sentence = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;

		return (
			<>
			<div className="confirm_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + (this._sended ? '' : ' hide')}>{state.resultConfirmHard.uid.length}/{App.students.length}</div>
				<ToggleBtn className={'btn_example' + (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				
				<div className="quiz_box">
					<div className="white_board">
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									{sentence}
								<BtnAudio className={'btn_audio'} url={App.data_url + data.main_sound}/>
								</div>
							</div>
						</div>
						<div className="hard_question">
							{
								this._jsx_questions.map((q, key) => (
									<div key={key}>
										<div>{key + 1}. {q.question}</div>
										<div className="answer_box">
											<div className={'sample' + (this._hint ? ' hide' : '')}/>
											<div className={'hint' + (this._hint ? '' : ' hide')}>
												{butil.parseBlock(q.answer, 'block')}
											</div>
										</div>
									</div>
								))
							}
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default ConfirmHardQuizBox;