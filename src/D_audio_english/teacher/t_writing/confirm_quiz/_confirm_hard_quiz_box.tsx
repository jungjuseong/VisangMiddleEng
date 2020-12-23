import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import * as butil from '@common/component/butil';

import { IConfirmHard,IProblemHard } from '../../../common';
import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';
import { BtnAudio } from '../../../../share/BtnAudio';
import VideoBox from '../../t_video_box';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';
import ConfirmQuizBox, { IConfirmQuizBoxProps } from './_confirm_quiz_box';
import { SENDPROG } from 'src/D_video_english/teacher/t_store';

@observer
class ConfirmHardQuizBox extends ConfirmQuizBox {

	private _jsx_questions: IProblemHard[] = [];
	private m_player = new MPlayer(new MConfig(true));
	public constructor(props: IConfirmQuizBoxProps) {
		super(props);

		const hard_data = props.data as IConfirmHard;
		this._jsx_questions.push(hard_data.problem1);
		this._jsx_questions.push(hard_data.problem1);
		this._jsx_questions.push(hard_data.problem1);
	}
	@action
	protected _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		this.props.onHintClick();
		this._hint = true;
		// this._doSwipe();
	}
	protected _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}
	private _refAudio = (btn: BtnAudio) => {
		if(this._btnAudio || !btn) return;
		this._btnAudio = btn;
	}

	public render() {
		const { data, state, actions,viewResult} = this.props;
		let sentence = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		let answerView = false
		const isQComplete = state.confirmHardProg >= SENDPROG.SENDED
		if(isQComplete){
			answerView = true
		}

		return (
			<>
			<div className="confirm_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + ((this._sended[2] && answerView) ? '' : ' hide')} onClick={()=>{viewResult(!isQComplete)}}>{state.resultConfirmHard.uid.length}/{App.students.length}</div>
				<ToggleBtn className={'btn_example' + ((this._sended[2] && answerView) ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				
				<div className="quiz_box">
					<div className="white_board">
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
						<div className="sentence_box">
							<div>
								<BtnAudio className="hide" url={App.data_url + data.directive.audio} ref={this._refAudio}/>
								<div className="question_box" onClick={this._onClick}>
									{sentence}
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