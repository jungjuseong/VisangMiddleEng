import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';

import { App } from '../../../App';

import { CoverPopup } from '../../../share/CoverPopup';
import { IScript, IRolePlay } from '../../common';
import { BtnAudio } from '../../../share/BtnAudio';
import { _getJSX, _getBlockJSX } from '../../../get_jsx';

interface IQuizBoxProps {
	view: boolean;
	role: IRolePlay;
	onClosed: () => void;
	data: IScript[];
}
@observer
class TransPopup extends React.Component<IQuizBoxProps> {
	@observable private _view = false;
	
	private _swiper?: Swiper;

    private _jsx_sentences: Array<{eng: JSX.Element, kor: JSX.Element}> = [];
	private _btnAudio?: BtnAudio;

	public constructor(props: IQuizBoxProps) {
		super(props);
		
		for(let sentence of props.data) {
			this._jsx_sentences.push({eng: _getJSX(sentence.dms_eng), kor: _getJSX(sentence.dms_kor)});
		}
	}

	private _onClosePopup = () => {
		App.pub_playBtnTab();
		this._view = false;
	}

	private _onClick = () => {
		if(this._btnAudio) this._btnAudio.toggle();
	}

 	public componentDidUpdate(prev: IQuizBoxProps) {
		this._jsx_sentences.length = 0
		for(let sentence of this.props.data) {
			this._jsx_sentences.push({eng: _getJSX(sentence.dms_eng), kor: _getJSX(sentence.dms_kor)});
		}
		const { view } = this.props;
		if(view && !prev.view) {
			this._view = true;
			if(this._swiper) {
				this._swiper.slideTo(0, 0);
				this._swiper.update();
				if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
			}
			_.delay(() => {
				if(this._swiper) {
					this._swiper.slideTo(0, 0);
					this._swiper.update();
					if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
				}				
			}, 300);

		} else if(!view && prev.view) {
			this._view = false;	
			App.pub_stop();
		}
	}
	
	public render() {
		const { onClosed, data } = this.props;

		return (
			<>
			<CoverPopup className="pop_trans" view={this._view} onClosed={onClosed} >
				<div className="pop_bg">
					<ToggleBtn className="btn_trans_close" onClick={this._onClosePopup}/>
						<div className="popbox">
							<div className="sentence_box">
								<div>
								{this._jsx_sentences.map((sentence, idx) =>{
									let speaker;
									if (data[idx].speaker === "Man")  speaker = 'M';
									else if (data[idx].speaker === "Woman")  speaker = 'W';
									else speaker = '';

									return(<>
										<div className="question_box" onClick={this._onClick}>{speaker}: {sentence.eng}</div>
										<div className="kor_question_box" onClick={this._onClick}>{speaker}: {sentence.kor}</div>
										</>)
									}
								)}
								</div>
							</div>
						</div>
				</div>
			</CoverPopup>
			</>
		);
	}
}
export default TransPopup;