import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';

import { CoverPopup } from '../../../share/CoverPopup';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';
import { SENDPROG, IStateCtx, IActionsCtx , IQuizNumResult } from '../t_store';

interface IQuizBoxProps {
	view: boolean;
	state : IStateCtx;
	onClosed: () => void;
	tap :'INTRODUCTION'|'CONFIRM'|'ADDITIONAL'|'DICTATION'|'SCRIPT'
	idx : number
}
@observer
class CheckResult extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	// @observable private _result : result
	
	private _swiper?: Swiper;

	public constructor(props: IQuizBoxProps) {
		super(props);
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
	
	public render() {
		const { onClosed, state} = this.props;
		
		const arr = state.resultConfirmSup.uid
		console.log('uiduid',state.resultConfirmSup.uid.length)
		console.log('uid',arr[0])
		console.log(App.students[0]?.name)
	
		return (
			<>
			<CoverPopup className="result_view" view={this._view} onClosed={onClosed} >
				<div className="pop_bg">
					<ToggleBtn className="btn_letstalk_close" onClick={this._onClosePopup}/>
					{/* <div className={'subject_rate' + (this._sended ? '' : ' hide')} onClick={viewResult}>
						{this.props.state.resultConfirmBasic.uid.length}/{App.students.length}
					</div> */}
						<div className="popbox">
							<div className="content">
								<div className="table">
									{arr.map((uid , idx)=>{
										return(
											<div key={idx}>
												<img className="thumnail" src={state.resultConfirmSup.url[idx][0]}></img>
												<div className="status">
													<div className="s_img">
														<img src={App.students[this.findStudentName(uid)]?.thumb}></img>
													</div>
													<p className="s_name">{App.students[this.findStudentName(uid)]?.nickname}</p>
													<div className="score"></div>
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