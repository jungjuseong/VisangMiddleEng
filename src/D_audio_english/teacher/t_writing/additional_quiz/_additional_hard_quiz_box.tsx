import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import { SENDPROG } from '../../t_store';
import { IAdditionalHard } from '../../../common';
import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';
import VideoBox from '../../t_video_box';
import { CorrectBar } from '../../../../share/Progress_bar';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';
import QuizBox, { IQuizBoxProps } from './_additional_quiz_box';

@observer
class HardQuizBox extends QuizBox {
	private m_player = new MPlayer(new MConfig(true));
	public render() {
		const { data, state, actions, viewResult} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_kor_sentence;
		let qResult = -1;
		const hard_data = data as IAdditionalHard[];
		const isQComplete = state.additionalHardProg >= SENDPROG.COMPLETE
		if(isQComplete) {
			if(state.numOfStudent > 0) qResult = Math.round(100 * state.resultAdditionalHard.arrayOfCorrect.filter((it) => it === true).length / state.numOfStudent);
			else qResult = 0;
			if(qResult > 100) qResult = 100;
		}
		return (
			<>
			<div className="additional_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + (this._sended[2] ? '' : ' hide')} onClick={()=>{viewResult(!isQComplete)}}>{state.resultAdditionalHard.uid.length}/{App.students.length}</div>
				<ToggleBtn className={'btn_answer' + (this._sended[2] ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				<CorrectBar 
					className={'correct_answer_rate' + (this._sended[2] ? '' : ' hide')} 
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
									<div className="video_container">
										<VideoBox
											data={actions.getData()}
											idx={2}
											isShadowPlay={false}
											onChangeScript={()=>{}}
											player={this.m_player} 
											playerInitTime={0} 
											roll={''}
											setShadowPlay={(val: boolean) => {}}
											shadowing={false}
											stopClick={()=>{}}
										/>
									</div>										
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
											<div className={'hint' + (this._hint ? '' : ' hide')}>
												{question.sentence1.answer1}
											</div>
										</div>
										{' → '}
										<div className="answer_box">
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