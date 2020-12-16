import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../../App';
import { IAdditionalSup } from '../../../common';
import { MPlayer, MConfig, MPRState } from '@common/mplayer/mplayer';
import VideoBox from '../../t_video_box';
import TableItem from './table-item';
import { CorrectBar } from '../../../../share/Progress_bar';

import { SENDPROG } from '../../t_store';

import { _getJSX, _getBlockJSX } from '../../../../get_jsx';
import QuizBox, { IQuizBoxProps } from './_additional_quiz_box';

@observer
class SupplementQuizBox extends QuizBox {

	@observable private _renderCnt = 0;
	@observable private _prog = SENDPROG.READY;

	private m_player = new MPlayer(new MConfig(true));
	private _done: string = '';

	public constructor(props: IQuizBoxProps) {
		super(props);
	}

	protected _viewAnswer = (evt: React.MouseEvent<HTMLElement>) => {
		console.log('viewHint');
		this._prog = SENDPROG.COMPLETE;
		this._done = 'done';
		this.props.onHintClick();
		this._hint = !this._hint;
		this._doSwipe();
	}

	public render() {
		const { data ,view,state, actions} = this.props;
		let jsx = (this._trans) ? this._jsx_eng_sentence : this._jsx_kor_sentence;
		let qResult = -1;
		const supplement_data = data as IAdditionalSup[];

		if(state.additionalSupProg >= SENDPROG.COMPLETE) {
			if(state.numOfStudent > 0) qResult = Math.round(100 * state.resultAdditionalSup.arrayOfCorrect.filter((it) => it === true).length / state.numOfStudent);
			else qResult = 0;
			if(qResult > 100) qResult = 100;
		}
		return (
			<>
			<div className="additional_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<div className={'subject_rate' + (this._sended ? '' : ' hide')}>{state.resultAdditionalSup.uid.length}/{App.students.length}</div>
				<ToggleBtn className={'btn_answer' + (this._sended ? '' : ' hide')} on={this._hint} onClick={this._viewAnswer}/>
				<CorrectBar 
					className={'correct_answer_rate' + (this._sended ? '' : ' hide')} 
					preview={-1} 
					result={qResult}
				/>
				<div className="quiz_box">
					<div className={'white_board ' + this._done} >
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
						<div className="table_box">
							{supplement_data.map((graphic,idx) =>
								<div key={idx}>
									<TableItem
										viewCorrect={this._prog === SENDPROG.COMPLETE}
										disableSelect={this._prog === SENDPROG.COMPLETE}
										viewResult={this._prog === SENDPROG.COMPLETE}
										inview={view}
										graphic={graphic}
										className="type_3"
										maxWidth={1000}
										renderCnt={this._renderCnt}
										optionBoxPosition="bottom"
										viewBtn={false}
										idx={idx}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default SupplementQuizBox;