import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../App';

import { IIntroduction } from '../../common';
import { BtnAudio } from '../../../share/BtnAudio';

import { _getJSX, _getBlockJSX } from '../../../get_jsx';

interface IQuizBox {
	view: boolean;
	onClosed: () => void;
	data: IIntroduction;
}
@observer
class IntroQuiz extends React.Component<IQuizBox> {
	@observable private _view = false;
	@observable private _hint = false;	

	private _jsx_sentence: JSX.Element;
	private _jsx_hint: JSX.Element;

	private _btnAudio?: BtnAudio;
	
	public constructor(props: IQuizBox) {
		super(props);
		
		this._jsx_sentence = _getJSX(props.data.questions); // 문제
		this._jsx_hint = _getJSX(props.data.ex_answer); // 답
	}

	private _viewAnswer = () => {
		App.pub_playBtnTab();
		this._hint = !this._hint;
	}

	private _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}

 	public componentDidUpdate(prev: IQuizBox) {
		const { view } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._hint = false;

		} else if(!view && prev.view) {
			this._view = false;	
			App.pub_stop();
		}
	}
	
	public render() {
		const { data } = this.props;
		return (
			<>
			<div className="intro_question_bg" style={{ display: this._view ? '' : 'none' }}>
				<ToggleBtn className="btn_example" on={this._hint} onClick={this._viewAnswer}/>
				<div className="quiz_box">
					<div className="white_board">
						<div className="image_box">
							<img  src={App.data_url + data.img} draggable={false}/>
						</div>	
					</div>
					<div className="sentence_box">
						<div>
							<div className="question_box" onClick={this._onClick}>
								{this._jsx_sentence}
							</div>
						</div>
					</div>
					<div className="speechbubble_box" >
						<div className={(this._hint ? ' view-hint' : '')}>
							<div className={'sample' + (this._hint ? ' hide' : '') + (this._hint ? ' hide' : '')}/>
							<div className={'hint' + (this._hint ? '' : ' hide')}>
								{this._jsx_hint}
							</div>
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}
}

export default IntroQuiz;