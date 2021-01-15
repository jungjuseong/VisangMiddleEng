import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable, toJS } from 'mobx';

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
	@observable private _viewChange : boolean = true
	private _selectColor : COLOR = 'pink'
	private _selectThumb = ''
	private _selectNickname = ''

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
	private _onChangeScreen = (bool : boolean) =>{
		const wrap2 = document.querySelector('.submit_status_popup .pop_bg .popbox .scroll');
		this._viewChange = bool
		wrap2?.scrollTo(0,0);
	}
	private _closeResultScreen = () => {
		this._viewResult = false;
	}
	private _viewResultScreen = (idx : number, color:COLOR , thumb:string, nickname:string) => {
		App.pub_playBtnTab();
		this._currentIdx = idx;
		this._viewResult = true;
		this._selectColor = color;
		this._selectThumb = thumb;
		this._selectNickname = nickname;
	}

 	public componentDidUpdate(prev: IQuizBoxProps) {
		const { view } = this.props;
		if(view && !prev.view) {
			this._view = true;
			this._viewChange = true
			this._corfal = 0;
		} else if(!view && prev.view) {
			this._view = false;	
			this._viewChange = true
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
	private checkStdudentName(arr : string[] ,id : string){
		let re_num = -1
		arr.map((name ,idx)=>{
			if(name === id){
				re_num = idx
			}
		})
		return re_num
	}

	private setCorfal(bool : 0|1|2){
		const wrap1 = document.querySelector('.submit_status_popup .pop_bg .popbox .content .scroll');
		this._corfal = bool
		wrap1?.scrollTo(0,0);
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
		arr = toJS(arr);
		let nosendstudent :IStudent[]= []
		App.students.map((student, idx)=>{
			console.log('arrarrarr',arr, student.name)
			console.log('chechechelk',this.checkStdudentName(arr, student.name))
			if(this.checkStdudentName(arr, student.name) === -1){
				nosendstudent.push(student)
			}
		})
		
		return (
			<>
			<CoverPopup className="submit_status_popup" view={this._view} onClosed={onClosed} >
				<div className={"pop_bg" + (this._viewChange? '' : ' hide')} >
					<ToggleBtn className="btn_popup_close" onClick={this._onClosePopup}/>
					<div className="subject_rate">
						{arr.length}/{App.students.length}
					</div>
						<div className="popbox">
							{/* 결과확인 페이지 */}
							<div className="submit_status">
								<div className="right_top">
									<button className="toggle_btn" onClick={()=>{this._onChangeScreen(false)}}/>
								</div>
								<div className="table scroll">
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
												<img className = {this._color[idx]} src={App.students[this.findStudentName(uid)]?.thumb}></img>
												<div className="status">
													<p className="s_name">{App.students[this.findStudentName(uid)]?.nickname}</p>
													<div className="score">0</div>
												</div>
											</div>
										);
									})}
									{nosendstudent.map((student , idx)=>{
										return(
											<div className="status no_send" key={idx}>
												<img className = {this._color[idx]} src={student.thumb}></img>
												<div>
													<p className="s_name">{student.nickname}</p>
													<div className="score">0</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
				</div>
				<div className={"pop_bg" + (this._viewChange? ' hide' : '')}>
					<ToggleBtn className="btn_popup_close" onClick={this._onClosePopup}/>
					<div className="subject_rate">
						{arr.length}/{App.students.length}
					</div>
						<div className="popbox">
							{/* 제출현황 */}
							<div className="content">
								<div className="right_top">
									<button className="toggle_btn" onClick={()=>{this._onChangeScreen(true)}}/>
								</div>
								<div className="sort_category">
									<ToggleBtn className="all_student" on={this._corfal=== 0} style={{display : answer? 'none' : ''}} onClick={() =>{this.setCorfal(0)}}/>
									<ToggleBtn className="correct_answer" on={this._corfal=== 1} style={{display : answer? 'none' : ''}}onClick={() =>{this.setCorfal(1)}}/>
									<ToggleBtn className="wrong_answer" on={this._corfal=== 2} style={{display : answer? 'none' : ''}}onClick={() =>{this.setCorfal(2)}}/>
								</div>
								<div className="table scroll">
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
												<img className="thumbnail" src={url} onClick={()=>this._viewResultScreen(idx,this._color[idx],App.students[this.findStudentName(uid)]?.thumb,App.students[this.findStudentName(uid)]?.nickname)}></img>
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
							idx = {this._currentIdx}
							onClosed={this._closeResultScreen}
							color = {this._selectColor}
							thumb = {this._selectThumb}
							nickname = {this._selectNickname}
						/>
				</div>
			</CoverPopup>
			</>
		);
	}
}
export default SubmitStatusPopup;