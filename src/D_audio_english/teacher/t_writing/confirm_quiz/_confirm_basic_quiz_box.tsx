import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import { CorrectBar } from '../../../../share/Progress_bar';
import { SENDPROG } from '../../t_store';
import { BtnAudio } from '../../../../share/BtnAudio';
import { _getJSX, _getBlockJSX } from '../../../../get_jsx';
import { IConfirmNomal } from '../../../common';

import ConfirmQuizBox, { IConfirmQuizBoxProps } from './_confirm_quiz_box';

@observer
class ConfirmBasicQuizBox extends ConfirmQuizBox {
	
	private _jsx_hints: number[] = [0,0,0];

	public constructor(props: IConfirmQuizBoxProps) {
		super(props);
		
		const basic_data = props.data as IConfirmNomal;
		this._jsx_hints = [basic_data.item1.answer, basic_data.item2.answer, basic_data.item3.answer]; // 답
	}

	@action	
	protected _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		if(!this._hint) {
			this.props.onHintClick();
			this._hint = true;
			
			this._doSwipe();
		}
	}

	public render() {
		const { state, data } = this.props;
		const basic_data = data as IConfirmNomal;

		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		let qResult = -1;

		if(state.confirmBasicProg >= SENDPROG.COMPLETE) {
			if(state.numOfStudent > 0) qResult = Math.round(100 * state.resultConfirmBasic.arrayOfCorrect.filter((it) => it === true).length / state.numOfStudent);
			else qResult = 0;
			if(qResult > 100) qResult = 100;
		}

		return (
			<>
			<div className="confirm_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + (this._sended ? '' : ' hide')}>{this.props.state.resultConfirmBasic.uid.length}/{App.students.length}</div>
				<CorrectBar 
					className={'correct_answer_rate' + (this._sended ? '' : ' hide')} 
					preview={-1} 
					result={qResult}
				/>
				<ToggleBtn className={'btn_answer' + (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				<div className="quiz_box">
					<div className="white_board basic">
						<ToggleBtn className="btn_trans" on={this._trans} onClick={this._viewTrans}/>
						<div className="sentence_box">
							<div>
								<div className="question_box" onClick={this._onClick}>
									{jsx}
									<BtnAudio className={'btn_audio'} url={App.data_url + this.props.data.main_sound}/>	
								</div>
							</div>
						</div>
						<div className="image_box">
							<img src={App.data_url + basic_data.item1.img} draggable={false}/>
							<img src={App.data_url + basic_data.item2.img} draggable={false}/>
							<img src={App.data_url + basic_data.item3.img} draggable={false}/>
						</div>	
					</div>
					<div className="speechbubble_box" >
						<div className={(this._hint ? ' view-hint' : '')}>
							<div className={'sample' + (this._hint ? ' hide' : '')}/>
							<div className={'hint' + (this._hint ? '' : ' hide')}>
								{this._jsx_hints[0]},{this._jsx_hints[1]},{this._jsx_hints[2]}
							</div>
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default ConfirmBasicQuizBox;