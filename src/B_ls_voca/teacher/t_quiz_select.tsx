import * as React from 'react';
import { observer } from 'mobx-react';

import { IStateCtx, IActionsCtx } from './t_store';
import * as _ from 'lodash';
import { TypeQuiz } from '../common';
import { ToggleBtn } from '@common/component/button';
import { observable } from 'mobx';

import { App } from '../../App';
import * as felsocket from '../../felsocket';
import * as kutil from '@common/util/kutil';

interface IBtnItemProps {
	myQuestionType: TypeQuiz;
	qtype: TypeQuiz;
	// average: number;
	// viewSingleBtn: boolean;
	// view_s: boolean;
	// view_g: boolean;
	onClick: (qtype: TypeQuiz) => void;
	onResult: (qtype: TypeQuiz, isGroup: boolean) => void;
}

const BtnItem: React.FC<IBtnItemProps> = ({onClick, qtype, myQuestionType}) => {
	const _onClick = () => {
		onClick(myQuestionType);
	}

	return (
		<div className={'quiz_' + myQuestionType}>
			<ToggleBtn className={'btn_quiz_' + myQuestionType} on={myQuestionType === qtype} onClick={_onClick}/>
		</div>
	);			
};

interface IQuizSelectProps {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class QuizSelect extends React.Component<IQuizSelectProps> {
	private _sound_avg = -1;
	private _meaning_avg = -1;
	private _spelling_avg = -1;
	private _sentence_avg = -1;

	@observable private _quiztype: TypeQuiz = '';
	@observable private _numOfStudent = 0;


	private _sound_result: any;
	private _meaning_result: any;
	private _spelling_result: any;
	private _sentence_result: any;

	
	private _onClickBtn = (qtype: TypeQuiz) => {
		App.pub_playBtnTab();
		this._quiztype = (this._quiztype === qtype) ? '' : qtype;
	}

	private _onResult = (qtype: TypeQuiz, isGroup: boolean) => {
		const { actions } = this.props;
		if(actions.gotoQuizResult(qtype, isGroup)) {
			App.pub_playBtnTab();
		}
	}

	private _onSingle = () => {
		if(this._quiztype === '') return;
		App.pub_playBtnTab();
		this.props.actions.setQuizInfo([], 5, false);
		// this.props.state.isGroup = false;
		this.props.state.quizType = this._quiztype;
		this.props.state.prog = 'timer';
	}

	private _onGroup = () => {
		const { state, actions } = this.props;

		if(this._quiztype === '' || this._numOfStudent < 2) return;
		App.pub_playBtnTab();
		actions.setQuizInfo([], 5, true);
		// this.props.state.isGroup = true;
		state.quizType = this._quiztype;
		state.prog = 'grouping';
	}

	private _setNavi() {
		const { state, actions} = this.props;

		actions.setNaviView(true);
		actions.setNavi(true, App.nextBook);
		actions.setNaviFnc(() => state.prog = 'list', null);
	}
	private _reloadedStudent = async () => {
		const { view } = this.props;

		if(view) {
			this._numOfStudent = App.students.length;
			await kutil.wait(3000);
			App.pub_reloadStudents(this._reloadedStudent);
		} else {
			this._numOfStudent = 0;
		}
		return;
	}

	public componentWillUpdate(next: IQuizSelectProps) {
		const { view } = this.props;

		if(next.view && !view) {
			felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
			this._setNavi();
			this._quiztype = '';
			if(next.state.hasPreview) {
				const words = next.actions.getWords();
				let sound = 0;
				let meaning = 0;
				let spelling = 0;
				let sentence = 0;
				for(const word of words) {
					sound += word.app_sound;
					meaning += word.app_meaning;
					spelling += word.app_spelling;
					sentence += word.app_sentence;
				}
				this._sound_avg = Math.round(sound / words.length);
				this._meaning_avg = Math.round(meaning / words.length);
				this._spelling_avg = Math.round(spelling / words.length);
				this._sentence_avg = Math.round(sentence / words.length);
			} else {
				this._sound_avg = -1;
				this._meaning_avg = -1;
				this._spelling_avg = -1;
				this._sentence_avg = -1;				
			}

			this._sound_result = next.actions.getQuizResult('sound');
			this._meaning_result = next.actions.getQuizResult('meaning');
			this._spelling_result = next.actions.getQuizResult('spelling');
			this._sentence_result = next.actions.getQuizResult('usage');
		}
	}
	public componentDidUpdate(prev: IQuizSelectProps) {
		if(this.props.view && !prev.view) {
			this._numOfStudent = 0;
			App.pub_reloadStudents(this._reloadedStudent);
		}
	}
	public render() {
		const { view } = this.props;

		const qtype = this._quiztype;
		const selected = this._quiztype !== '';
		// const viewSingle = this._souns_s || this._meaning_s || this._spelling_s || this._sentence_s;
		const style: React.CSSProperties = {};

		if(!view) {
			style.visibility = 'hidden';
			style.transition = 'visibility 0.3s 0.3s';
		}

		return (
			<div className="t_quiz_select" style={style}>
				<div className="title">QUIZ</div>
				<div className="quiz">
					<BtnItem 
						myQuestionType="sound" 
						qtype={qtype} 
						// average={this._sound_avg} 
						// viewSingleBtn={viewSingle} 
						// view_s={this._sound_result.single != null} 
						// view_g={this._sound_result.group != null} 
						onClick={this._onClickBtn}
						onResult={this._onResult}
					/>
					<BtnItem 
						myQuestionType="meaning" 
						qtype={qtype} 
						// average={this._meaning_avg} 
						// viewSingleBtn={viewSingle} 
						// view_s={this._meaning_result.single != null} 
						// view_g={this._meaning_result.group != null} 
						onClick={this._onClickBtn}
						onResult={this._onResult}
					/>
					<BtnItem 
						myQuestionType="spelling" 
						qtype={qtype} 
						// average={this._spelling_avg} 
						// viewSingleBtn={viewSingle} 
						// view_s={this._spelling_result.single != null} 
						// view_g={this._spelling_result.group != null} 
						onClick={this._onClickBtn}
						onResult={this._onResult}
					/>	
					<BtnItem 
						myQuestionType="usage" 
						qtype={qtype} 
						// average={this._sentence_avg} 
						// viewSingleBtn={viewSingle} 
						// view_s={this._sentence_result.single != null} 
						// view_g={this._sentence_result.group != null} 
						onClick={this._onClickBtn}
						onResult={this._onResult}
					/>
		
				</div>
				<div className="t_choice">
					<ToggleBtn className="single" disabled={!selected} onClick={this._onSingle}/>
					<ToggleBtn className={'group' + (this._numOfStudent < 2 ? ' hide' : '')} disabled={!selected} onClick={this._onGroup}/>
				</div>
			</div>
		);
	}
}

export default QuizSelect;


