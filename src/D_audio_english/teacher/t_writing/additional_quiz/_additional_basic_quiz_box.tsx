import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import { SENDPROG } from '../../t_store';
import { CorrectBar } from '../../../../share/Progress_bar';
import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';
import VideoBox from '../../t_video_box';
import { IAdditionalBasic } from '../../../common';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

import QuizBox, { IQuizBoxProps } from './_additional_quiz_box';

@observer
class BasicQuizBox extends QuizBox {

	private m_player = new MPlayer(new MConfig(true));
	public render() {
		const { data, state, actions, viewResult} = this.props;
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
				<div className={'subject_rate' + (this._sended[1] ? '' : ' hide')} onClick={()=>{viewResult(true)}}>{state.resultAdditionalBasic.uid.length}/{App.students.length}</div>
				<ToggleBtn className={'btn_answer' + (this._sended[1] ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				<CorrectBar 
					className={'correct_answer_rate' + (this._sended[1] ? '' : ' hide')} 
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
												<div key={key} className="answer_box" >
													<div className={'sample' + (this._hint ? ' hide' : '')} style={{ borderBottom: answer !== '' ? '' : 'none' }}/>
													<div className={'hint' + (this._hint ? '' : ' hide')} style={{ borderBottom: answer !== '' ? '' : 'none' }}>
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