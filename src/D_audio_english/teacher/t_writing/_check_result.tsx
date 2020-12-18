import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';

import { CoverPopup } from '../../../share/CoverPopup';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';
import { SENDPROG, IStateCtx, IActionsCtx , IQuizNumResult } from '../t_store';
import { stat } from 'fs';

export type COLOR = 'pink'|'green'|'orange'|'purple';

interface IQuizBoxProps {
	view: boolean;
	state : IStateCtx;
	onClosed: () => void;
	tap :'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT';
	idx : number;
}
@observer
class CheckResult extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _color : COLOR[] = [];
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

 	public componentDidUpdate(prev: IQuizBoxProps) {

		const { view } = this.props;
		if(view && !prev.view) {
			this._view = true;
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

	private setColor(){	
		let cidx = 0;
		let color_list :COLOR[] = [];
		const s_num = this.props.state.resultConfirmSup.uid;
		console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" + s_num);
		const colors : COLOR[] = ['pink', 'green', 'orange', 'purple'];
		for(let i = 0; i<s_num.length; i++) {
			cidx = Math.floor(Math.random() * s_num.length);
			color_list.push(colors[cidx]);
		}
		console.log(color_list);
		this._color = color_list;
	}
	
	public render() {
		const { onClosed, state, idx, tap} = this.props;
		const coarray = [state.resultConfirmSup,state.resultConfirmBasic,state.resultConfirmHard]
		const adarray = [state.resultAdditionalSup,state.resultAdditionalBasic,state.resultAdditionalHard]
		let arr :string[] = []
		let result : string[][] = []
		switch(tap){
			case 'ADDITIONAL' :{
				arr = adarray[idx].uid
				result = adarray[idx].url
				break
			}
			case 'CONFIRM' : {
				arr = coarray[idx].uid
				result = coarray[idx].url
				break
			}
			case 'DICTATION': {
				arr = state.resultDictation[idx].uid
				result = state.resultDictation[idx].url
				break
			}
			default : break
		}
		
	
		return (
			<>
			<CoverPopup className="result_view" view={this._view} onClosed={onClosed} >
				<div className="pop_bg">
					<ToggleBtn className="btn_letstalk_close" onClick={this._onClosePopup}/>
					<div className="subject_rate">
						{this.props.state.resultConfirmBasic.uid.length}/{App.students.length}
					</div>
						<div className="popbox">
							<div className="content">
							<ToggleBtn className="btn_total"/>
								<div className="table">
									{arr.map((uid , idx)=>{
										let url = '';
										if (result[idx] !== undefined){
											url = result[idx][0];
										}
										return(
											<div key={idx}>
												<img className="thumnail" src={url}></img>
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
				</div>
			</CoverPopup>
			</>
		);
	}
}
export default CheckResult;