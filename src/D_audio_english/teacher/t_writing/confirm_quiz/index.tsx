import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { IStateCtx, IActionsCtx } from '../../t_store';
import { App } from '../../../../App';
import { IData } from '../../../common';
import { _getJSX, _getBlockJSX } from '../../../../get_jsx';

import ConfirmSupplementQuizBox from './_confirm_supplement_quiz_box';
import ConfirmBasicQuizBox from './_confirm_basic_quiz_box';
import ConfirmHardQuizBox from './_confirm_hard_quiz_box';

interface IQuizBoxProps {
	view: boolean;
	actions: IActionsCtx;
	state: IStateCtx;
	index: number;
	onClosed: () => void;
	onHintClick: () => void;
	mdata: IData;
	viewResult: (answerboolean : boolean) => void;
}
@observer
class ConfirmQuiz extends React.Component<IQuizBoxProps> {

	private _swiper?: Swiper;

	private readonly _soption: SwiperOptions = {
		direction: 'vertical',
		observer: true,
		slidesPerView: 'auto',
		freeMode: true,
		mousewheel: true,			
		noSwiping: false,
		followFinger: true,
		scrollbar: {el: '.swiper-scrollbar',draggable: true, hide: false},	
	};

 	public componentDidUpdate(prev: IQuizBoxProps) {
		const { view } = this.props;
		if(view && !prev.view) {

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
			App.pub_stop();
		}
	}
	
	public render() {
		const { mdata, view,index, onClosed, onHintClick ,state, actions, viewResult} = this.props;
		return (
			<>
				<ConfirmSupplementQuizBox view={view && index === 0} actions={actions} state={state} data={mdata.confirm_sup[0]} onClosed={onClosed} onHintClick={onHintClick} viewResult={viewResult}/>
				<ConfirmBasicQuizBox view={view && index === 1} actions={actions} state={state} data={mdata.confirm_nomal[0]} onClosed={onClosed} onHintClick={onHintClick} viewResult={viewResult}/>
				<ConfirmHardQuizBox view={view && index === 2} actions={actions} state={state} data={mdata.confirm_hard[0]} onClosed={onClosed} onHintClick={onHintClick} viewResult={viewResult}/>
			</>
		);
	}
}

export default ConfirmQuiz;