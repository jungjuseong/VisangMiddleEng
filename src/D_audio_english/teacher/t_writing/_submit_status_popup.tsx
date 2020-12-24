import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';

import { CoverPopup } from '../../../share/CoverPopup';
import ResultScreenPopup from './_result_screen_popup';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';
import { SENDPROG, IStateCtx, IActionsCtx , IQuizNumResult } from '../t_store';
import { stat } from 'fs';

export type COLOR = 'pink'|'green'|'orange'|'purple';

interface IQuizBoxProps {
	view: boolean;
	state : IStateCtx;
	answer : boolean;
	onClosed: () => void;
	tab :'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT';
	idx : number;
}
@observer
class SubmitStatusPopup extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _color : COLOR[] = [];
	@observable private _corfal : 0|1|2 = 0;
	@observable private _viewResult : boolean = false;
	@observable private _currentIdx : number = 0;
	// @observable private _result : result
	
	private _swiper?: Swiper;

	public constructor(props: IQuizBoxProps) {
		super(props);
		this.setColor();
	}

	private _onClosePopup = () => {
		App.pub_playBtnTab();
		this._view = false;
	}

	private _closeResultScreen = () => {
		this._viewResult = false;
	}
	private _viewResultScreen = (idx : number) => {
		App.pub_playBtnTab();
		this._currentIdx = idx;
		this._viewResult = true;
	}

 	public componentDidUpdate(prev: IQuizBoxProps) {

		const { view } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._corfal = 0;
		} else if(!view && prev.view) {
			this._view = false;	
			App.pub_stop();
		}
	}

	private findStudentName(uid : string){
		let re_num = -1
		App.students.map((student, idx)=>{
			if(student.name === uid){
				re_num = idx
			}
		})
		return re_num
	}

	private setCorfal(bool : 0|1|2){
		this._corfal = bool
	}

	private setColor(){	
		let cidx = 0;
		let color_list :COLOR[] = [];
		const s_num = App.students;
		const colors : COLOR[] = ['pink', 'green', 'orange', 'purple'];
		for(let i = 0; i<s_num.length; i++) {
			cidx = Math.floor(Math.random() * s_num.length);
			color_list.push(colors[cidx]);
		}
		this._color = color_list;
	}
	
	public render() {
		const { onClosed, state, idx, tab, answer} = this.props;
		const coarray = [state.resultConfirmSup,state.resultConfirmBasic,state.resultConfirmHard]
		const adarray = [state.resultAdditionalSup,state.resultAdditionalBasic,state.resultAdditionalHard]
		let arr :string[] = []
		let result : string[][] = []
		let correct :boolean[] = []
		switch(tab){
			case 'ADDITIONAL' :{
				result = adarray[idx].url
				arr = adarray[idx].uid
				correct = adarray[idx].arrayOfCorrect
				break
			}
			case 'CONFIRM' : {
				result = coarray[idx].url
				arr = coarray[idx].uid
				if(idx === 0){
					correct = state.resultConfirmSup.arrayOfCorrect
				}else if (idx ===1){
					correct = state.resultConfirmBasic.arrayOfCorrect
				}else{
					correct = []
				}
				break
			}
			case 'DICTATION': {
				result = state.resultDictation[idx].url
				arr = state.resultDictation[idx].uid
				correct = state.resultDictation[idx].arrayOfCorrect
				break
			}
			default : break
		}
		
	
		return (
			<>
			<CoverPopup className="submit_status_popup" view={this._view} onClosed={onClosed} >
				<div className="pop_bg">
					<ToggleBtn className="btn_popup_close" onClick={this._onClosePopup}/>
					<div className="subject_rate">
						{arr.length}/{App.students.length}
					</div>
						<div className="popbox">
							<div className="content">
								<div>
									<ToggleBtn className="all_student" onClick={() =>{this.setCorfal(0)}}/>
									<ToggleBtn className="correct_answer" style={{display : answer? 'none' : ''}}onClick={() =>{this.setCorfal(1)}}/>
									<ToggleBtn className="wrong_answer" style={{display : answer? 'none' : ''}}onClick={() =>{this.setCorfal(2)}}/>
								</div>
								<div className="table">
									{arr.map((uid , idx)=>{
										let url = '';
										if(result[idx] !== undefined){
											url = result[idx][0];
										}
										if(this._corfal === 0){
										}else if(this._corfal === 1){
											if(correct[idx] === false){
												return;
											}
										}else{
											if(correct[idx] === true){
												return;
											}
										}
										return(
											<div key={idx}>
												<img className="thumnail" src={url} onClick={()=>this._viewResultScreen(idx)}></img>
												<div className="status">
													<img className = {this._color[idx]} src={App.students[this.findStudentName(uid)]?.thumb}></img>
													<div>
														<p className="s_name">{App.students[this.findStudentName(uid)]?.nickname}</p>
														<div className="score">0</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
						<ResultScreenPopup
							view={this._viewResult}
							result={result}
							answer={answer}
							tab = {tab}
							idx = {this._currentIdx}
							onClosed={this._closeResultScreen}
						/>
				</div>
			</CoverPopup>
			</>
		);
	}
}
export default SubmitStatusPopup;