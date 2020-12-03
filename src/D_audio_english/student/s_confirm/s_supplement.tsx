import * as React from 'react';
import Draggable from 'react-draggable';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { observer, PropTypes } from 'mobx-react';
import { observable } from 'mobx';

import { _getJSX } from '../../../get_jsx';
import { App } from '../../../App';
import { NONE } from 'src/share/style';

interface IQuizItem {
	view: boolean;
	idx: number;
	data: common.IConfirmSup;
	confirmProg: QPROG;
	onChoice: (idx: number, choice: number) => void;
}
@observer
class QuizItem extends React.Component<IQuizItem> {
	@observable private _toggle: Array<number> = [0,0,0];

	private _disable_toggle: boolean
	private	_answer_dic: {};
	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _jsx_question1: common.IProblemSup;
	private _jsx_question2: common.IProblemSup;
	private _jsx_question3: common.IProblemSup;
	private _jsx_question1_answer: number;
	private _jsx_question2_answer: number;
	private _jsx_question3_answer: number;

	public constructor(props: IQuizItem) {
		super(props);
		this._jsx_sentence = _getJSX(props.data.directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data.directive.eng); // 문제
		this._jsx_question1= props.data.problem1;
		this._jsx_question2= props.data.problem2;
		this._jsx_question3= props.data.problem3;
		this._jsx_question1_answer= props.data.problem1.answer;
		this._jsx_question2_answer= props.data.problem2.answer;
		this._jsx_question3_answer= props.data.problem3.answer;
		this._answer_dic = {1:true, 2:false};
		this._disable_toggle = false;
	}

	private _onClickTrue = (param: 0 | 1 | 2) =>{
		if (this._disable_toggle) return;
		this._toggle[param] = 1;
		this.props.onChoice(param, 1);
	}
	private _onClickFalse = (param: 0 | 1 | 2) =>{
		if (this._disable_toggle) return;
		this._toggle[param] = 2;
		this.props.onChoice(param, 2);
	}
	private _getToggleState = (num: number) =>{
		if(this.props.confirmProg === QPROG.COMPLETE){
			switch(num){
				case 0 :{
					if(this._jsx_question1_answer === 1){
						return 'on_true'
					}else return 'on_false'
				}
				case 1 :{
					if(this._jsx_question2_answer === 1){
						return 'on_true'
					}else return 'on_false'
				}
				case 2 :{
					if(this._jsx_question3_answer === 1){
						return 'on_true'
					}else return 'on_false'
				}
			}
		}
		if(this._toggle[num] === 0) return '';
		if(this._toggle[num] === 1)
			return 'on_true';
		else
			return 'on_false';
	}
	state = {
		activeDrags: 0,
		deltaPosition: {
		x: 0, y: 0
		},
		controlledPosition: {
		x: -400, y: 200
		}
	};
	
	onStart = () => {
		this.setState({activeDrags: ++this.state.activeDrags});
	};
	
	onStop = () => {
		this.setState({activeDrags: --this.state.activeDrags});
	};
	public render() {
		const {view, confirmProg, data} = this.props;
		const dragHandlers = {onStart: this.onStart, onStop: this.onStop};
		let OXs: Array<''|'O'|'X'> = ['','',''];
		const answers = [data.problem1.answer,data.problem2.answer,data.problem3.answer]
		if(confirmProg == QPROG.COMPLETE){
			console.log('complete')
			OXs.map((OX,idx) =>{
				if(answers[idx] === this._toggle[idx]){
					OXs[idx] = 'O';
				}else{
					OXs[idx] = 'X';
				}
			})
			this._disable_toggle = true;
		}

		return (
			<>
				<div className="quiz_box" style={{display : view ? '' : 'none' }}>
					<div className="sup_question">
						<div className="quiz">
							<WrapTextNew view={view}>
								{this._jsx_sentence}
							</WrapTextNew>
						</div>
						<div>
							<div className="white_box">
								<p>1. {this._jsx_question1.question}</p>
								<span className={OXs[0]} ></span>
								<div className={"toggle_bundle " + this._getToggleState(0)}>
									<div className="true" onClick={()=>{this._onClickTrue(0)}}></div>
									<div className="false" onClick={()=>{this._onClickFalse(0)}}></div>
								</div>
							</div>
							<div className="white_box">
								<p>2. {this._jsx_question2.question}</p>
								<span className={OXs[1]}></span>
								<div className={"toggle_bundle " + this._getToggleState(1)}>
									<div className="true" onClick={()=>{this._onClickTrue(1)}}></div>
									<div className="false" onClick={()=>{this._onClickFalse(1)}}></div>
								</div>
							</div>
							<div className="white_box">
								<p>3. {this._jsx_question3.question}</p>
								<span className={OXs[2]}></span>
								<div className={"toggle_bundle " + this._getToggleState(2)}>
									<div className="true" onClick={()=>{this._onClickTrue(2)}}></div>
									<div className="false" onClick={()=>{this._onClickFalse(2)}}></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>		
		);
	}
}

export default QuizItem;