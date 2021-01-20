import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable, toJS } from 'mobx';

import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';

import { CoverPopup } from '../../../share/CoverPopup';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';
import { SENDPROG, IStateCtx, IActionsCtx , IQuizNumResult } from '../t_store';

export type COLOR = 'pink'|'green'|'orange'|'purple'|'white';

interface IQuizBoxProps {
	view: boolean;
	actions: IActionsCtx;
	idx : number;
	onClosed: () => void;
}
@observer
class SubmitScriptPopup extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	@observable private _color : COLOR = 'white';

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

	private findStudentId(uid : string){
		let re_num = -1
		App.students.map((student, idx)=>{
			if(student.id === uid){
				re_num = idx
			}
		})
		return re_num
	}

	private setColor(){	
		let cidx = 0;
		const colors : COLOR[] = ['pink', 'green', 'orange', 'purple'];
		const len = colors.length;
		while(true) {
			cidx = Math.floor(Math.random() * len);
			if(cidx < len) break;
		}
		// this._color = toJS(colors[cidx]);
	}
	
	public render() {
		const { onClosed, actions,idx} = this.props;
		let arr = toJS(actions.getQnaReturns()[idx]?.users);
		return (
			<>
			<CoverPopup className="submit_status_popup" view={this._view} onClosed={onClosed} >
				<div className={"pop_bg"} >
					<ToggleBtn className="btn_popup_close" onClick={this._onClosePopup}/>
					<div className="subject_rate">
						{arr?.length}/{App.students.length}
					</div>
						<div className="popbox">
							{/* 제출현황 */}
							<div className="submit_status">
								<div className="right_top">
								</div>
								<div className="table scroll">
									{arr?.map((uid , idx)=>{
										return(
											<div key={idx}>
												<img className = {this._color} src={toJS(App.students)[this.findStudentId(uid)]?.thumb}></img>
												<div className="status">
													<p className="s_name">{toJS(App.students)[this.findStudentId(uid)]?.nickname}</p>
													<div className="score">0</div>
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
export default SubmitScriptPopup;