import * as React from 'react';
import { observer } from 'mobx-react';

import { IStateCtx, IActionsCtx, BTN_DISABLE } from './t_store';
import { ToggleBtn } from '@common/component/button';
import { observable } from 'mobx';
import { App } from '../../App';

import * as _ from 'lodash';
import Warmup from './t_warmup';
import Passage from './t_passage';
import Question from './t_question';
import VideoPopup from './t_video_box';
import TStoryBook from './t_storybook';
import AdditionalQuiz from './_additional_pop_quiz';


interface ITComprehension {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class TComprehension extends React.Component<ITComprehension> {
	@observable private _Title: 'Comprehension'|'VISUALIZING'|'SUMMARIZING' = 'Comprehension';
	@observable private _Tab: 'Warmup'| 'Passage'|'Question' |'GraphicOrganizer'| 'Summary' = 'Warmup';
	@observable private _btn_disable: BTN_DISABLE = '';

	private _onBook = () => {
		App.pub_stop();
		this.props.state.viewStoryBook = !this.props.state.viewStoryBook;
	}
	private _onQuiz = () => {
		App.pub_stop();
		this.props.state.viewAdditionalQuiz = !this.props.state.viewAdditionalQuiz;
		this.props.actions.setNaviView(false);
	}
	private _offStoryBook = () => {
		this.props.state.viewStoryBook = false;
	}
	private _onVideo = () => {
		App.pub_stop();
		this.props.state.videoPopup = !this.props.state.videoPopup;
		this.props.actions.setNaviView(false);
	}
	private _offVideo = () => {
		console.log('TComprehension _offVideo');
		this.props.state.videoPopup = false;
	}

	private _clickComprension = (ev: React.MouseEvent<HTMLElement>) => {
		if(this._Title === 'Comprehension') return;
		App.pub_playBtnTab();
		this._btn_disable = '';
		this._Title = 'Comprehension';
		this._Tab = 'Warmup';
		this.props.state.isNaviBack = false;
	}
	private _clickVisual = (ev: React.MouseEvent<HTMLElement>) => {
		if(this._Title === 'VISUALIZING') return;
		App.pub_playBtnTab();
		this._btn_disable = '';
		this._Title = 'VISUALIZING';
		this._Tab = 'GraphicOrganizer';
		this.props.state.isNaviBack = false;
	}
	private _clickSummary = (ev: React.MouseEvent<HTMLElement>) => {
		if(this._Title === 'SUMMARIZING') return;
		App.pub_playBtnTab();
		this._btn_disable = '';
		this._Title = 'SUMMARIZING';
		this._Tab = 'Summary';
		this.props.state.isNaviBack = false;
	}

	// 탭 활성화
	private _clickWarmup = (ev: React.MouseEvent<HTMLElement>) => {
		if(this._Tab === 'Warmup') return;
		App.pub_playBtnTab();
		this._btn_disable = '';
		this._Tab = 'Warmup';
		this.props.state.isNaviBack = false;
	}
	private _clickPassage = (ev: React.MouseEvent<HTMLElement>) => {
		if(this._Tab === 'Passage') return;
		App.pub_playBtnTab();
		this._btn_disable = '';
		this._Tab = 'Passage';
		this.props.state.isNaviBack = false;
	}
	private _clickQuestion = (ev: React.MouseEvent<HTMLElement>) => {
		if(this._Tab === 'Question') return;
		App.pub_playBtnTab();
		this._btn_disable = '';
		this._Tab = 'Question';
		this.props.state.isNaviBack = false;
	}
	private _letsTalkClosed = () => {
		this.props.state.viewAdditionalQuiz = false;
		this.props.actions.setNaviView(true);
	}
	private _onSetNavi = (title: 'Comprehension'|'VISUALIZING'|'SUMMARIZING', tab: 'Warmup'| 'Passage'|'Question' |'GraphicOrganizer'| 'Summary') => {
		this._btn_disable = '';
		this._Title = title;
		this._Tab = tab;
	}

	private _onStuding = (studying: BTN_DISABLE) => {
		this._btn_disable = studying;
	}
	public componentDidUpdate(prev: ITComprehension) {
		if(this.props.view && !prev.view) {
			this._Title = 'Comprehension';
			this._Tab = 'Warmup';
			this._btn_disable = '';
			this.props.state.viewAdditionalQuiz = false;
		} else if(!this.props.view && prev.view) {
			//
		}
	}

	public render() {
		const {view, actions, state} = this.props;
		const data = actions.getData();

		return (
			<div className={'t_compre ' + this._Title}>
				<div className="top">
					<ToggleBtn className="btn_comprehension" on={this._Title === 'Comprehension'} disabled={this._btn_disable !== ''} onClick={this._clickComprension}/>
					{/* <ToggleBtn className="btn_visualizing" on={this._Title === 'VISUALIZING'} disabled={this._btn_disable !== ''} onClick={this._clickVisual}/>
					<ToggleBtn className="btn_summarizing" on={this._Title === 'SUMMARIZING'} disabled={this._btn_disable !== ''} onClick={this._clickSummary}/> */}
				</div>
				<ToggleBtn disabled={this._btn_disable === 'all'} className={'btn_book' + (this._Title === 'Comprehension' ? '' : ' up')} onClick={this._onBook}/>
				<ToggleBtn disabled={this._btn_disable === 'all'} className={'btn_video' + (this._Title === 'Comprehension' ? '' : ' up')} onClick={this._onVideo}/>
				<ToggleBtn disabled={this._btn_disable === 'all'} className={'btn_additional_quiz' + (this._Title === 'Comprehension' ? '' : ' up')} onClick={this._onQuiz}/>
				<div className="btn_tab" style={{display: this._Title === 'Comprehension' ? '' : 'none'}}>
					<ToggleBtn className="btn_warmup" on={this._Tab === 'Warmup' && this._Title === 'Comprehension'} disabled={this._btn_disable !== ''} onClick={this._clickWarmup} />
					<ToggleBtn className="btn_passage" on={this._Tab === 'Passage' && this._Title === 'Comprehension'} disabled={this._btn_disable !== ''} onClick={this._clickPassage} />
					<ToggleBtn className="btn_question" on={this._Tab === 'Question' && this._Title === 'Comprehension'} disabled={this._btn_disable !== ''} onClick={this._clickQuestion} />
				</div>

				<Warmup 
					view={view}
					inview={this._Tab === 'Warmup' && this._Title === 'Comprehension'} 
					videoPopup={this.props.state.videoPopup}
					viewStoryBook={this.props.state.viewStoryBook}
					data={data}
					state={state}
					actions={actions}
					onStudy={this._onStuding}
					onSetNavi={this._onSetNavi}
				/>
				<Passage 
					view={view}
					videoPopup={this.props.state.videoPopup}
					viewStoryBook={this.props.state.viewStoryBook}
					studying={this._btn_disable !== ''}
					inview={this._Tab === 'Passage' && this._Title === 'Comprehension'} 
					data={data}
					state={state}
					actions={actions}
					onStudy={this._onStuding}
					onSetNavi={this._onSetNavi}
				/>
				<Question 
					view={view}
					videoPopup={this.props.state.videoPopup}
					viewStoryBook={this.props.state.viewStoryBook}
					studying={this._btn_disable !== ''}
					inview={this._Tab === 'Question' && this._Title === 'Comprehension'} 
					data={data}
					state={state}
					actions={actions}
					onStudy={this._onStuding}
					onSetNavi={this._onSetNavi}
				/>

				{/* <GraphicOrganizer 
					view={view}
					videoPopup={this.props.state.videoPopup}
					viewStoryBook={this.props.state.viewStoryBook}
					inview={this._Tab === 'GraphicOrganizer' && this._Title === 'VISUALIZING'} 
					data={data}
					state={state}
					actions={actions}
					onStudy={this._onStuding}
					onSetNavi={this._onSetNavi}
				/>
				<Summary 
					view={view}
					videoPopup={this.props.state.videoPopup}
					viewStoryBook={this.props.state.viewStoryBook}
					inview={this._Tab === 'Summary' && this._Title === 'SUMMARIZING'} 
					data={data}
					state={state}
					actions={actions}
					onStudy={this._onStuding}
					onSetNavi={this._onSetNavi}
				/> */}
				
				<VideoPopup 
					view={this.props.state.videoPopup} 
					data={data}
					state={state}
					actions={actions}
					onClosed={this._offVideo}
				/>

				<TStoryBook 
					view={this.props.state.viewStoryBook} 
					data={data} 
					state={state} 
					actions={actions} 
					onClosed={this._offStoryBook}
				/>

				<AdditionalQuiz 
                    view={state.viewAdditionalQuiz} 
                    data={data.additional_quiz} 
					onClosed={this._letsTalkClosed}
					state={state}
                />
			</div>
		);
	}
}

export default TComprehension;
