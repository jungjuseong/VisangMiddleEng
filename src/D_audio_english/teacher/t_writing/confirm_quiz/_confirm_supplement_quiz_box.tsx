import * as React from 'react';
import * as _ from 'lodash';
import { observer, PropTypes } from 'mobx-react';
import { action, observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';

import { CorrectBar } from '../../../../share/Progress_bar';

import { SENDPROG, IStateCtx, IActionsCtx } from '../../t_store';

import { IProblemSup,IConfirmSup } from '../../../common';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';
import ConfirmQuizBox, { IConfirmQuizBoxProps } from './_confirm_quiz_box';

import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';
import VideoBox from '../../t_video_box';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizBox {
	view: boolean;
	actions: IActionsCtx;
	state: IStateCtx;
	onClosed: () => void;
	onHintClick: () => void;
	data: IConfirmSup;
	viewResult: () => void;
}
@observer
class ConfirmSupplementQuizBox extends ConfirmQuizBox {

	@observable private _toggle: Array<boolean|null> = [null,null,null];
	
	private m_player = new MPlayer(new MConfig(true));

	private _jsx_questions: IProblemSup[] = [];
	private _jsx_answers: number[] = [];

	private	_answer_dic: {};
	private _disable_toggle: boolean;
	
	public constructor(props: IQuizBox) {
		super(props);
		
		this._jsx_questions.push(props.data.problem1);
		this._jsx_questions.push(props.data.problem2);
		this._jsx_questions.push(props.data.problem3);

		this._jsx_answers.push(props.data.problem1.answer);
		this._jsx_answers.push(props.data.problem2.answer);
		this._jsx_answers.push(props.data.problem3.answer);

		this._answer_dic = {1: true, 2: false};
		this._disable_toggle = false;
	}

	private _onClickTrue = (param: 0 | 1 | 2) => {
		if (this._disable_toggle) return;
		this._toggle[param] = true;
	}

	private _onClickFalse = (param: 0 | 1 | 2) => {
		if (this._disable_toggle) return;
		this._toggle[param] = false;
	}

	private _getToggleState = (num: number) => {
		if(this._hint) {
			if(this._toggle[num] === null) return '';
			if(this._toggle[num]) return 'on_true_t';
			else return 'on_false_t';
		}
		if(this._toggle[num] === null) return '';
		if(this._toggle[num]) return 'on_true';
		else return 'on_false';
	}

	@action
	protected _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		if (this._disable_toggle === false) {
			this.props.onHintClick();
			this._toggle[0] = this._answer_dic[`${this._jsx_answers[0]}`];
			this._toggle[1] = this._answer_dic[`${this._jsx_answers[1]}`];
			this._toggle[2] = this._answer_dic[`${this._jsx_answers[2]}`];
			this._disable_toggle = this._hint = true;
	
			// this._doSwipe();
		}
	}
	
	public render() {
		const { data, state ,actions ,viewResult} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_sentence;
		let qResult = -1;

		if(state.confirmSupProg >= SENDPROG.COMPLETE) {
			if(state.numOfStudent > 0) qResult = Math.round(100 * state.resultConfirmSup.arrayOfCorrect.filter((it) => it === true).length / state.numOfStudent);
			else qResult = 0;
			if(qResult > 100) qResult = 100;
		}
		console.log('tsetset',state.resultConfirmSup.url)
		return (
			<>
			<div className="confirm_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + (this._sended ? '' : ' hide')} onClick={viewResult} >{state.resultConfirmSup.uid.length}/{App.students.length}</div>
				<CorrectBar 
					className={'correct_answer_rate' + (this._sended ? '' : ' hide')} 
					preview={-1} 
					result={qResult}
				/>
				<ToggleBtn className={'btn_answer' + (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
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
						<div className="sup_question">
							{
								this._jsx_questions.map((q,key) => (
									<div key={key}>
										<p>{key + 1}. {q.question}</p>
										<div className={'toggle_bundle ' + this._getToggleState(key as (0|1|2))}>
											<div className="true" onClick={() => this._onClickTrue(key as (0|1|2))}/>
											<div className="false" onClick={() => this._onClickFalse(key as (0|1|2))}/>
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

export default ConfirmSupplementQuizBox;