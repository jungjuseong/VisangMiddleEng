import * as React from 'react';

import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { ToggleBtn } from '@common/component/button';
import { App } from '../../../App';

import { IStateCtx, IActionsCtx } from '../t_store';
import { IWordData } from '../../common';
import StudyPopup from '../t_study_popup';
import VocaItem from './_voca_item';

const SwiperComponent = require('react-id-swiper').default;

interface IVocaList {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
}

class VocaList extends React.Component<IVocaList> {
	@observable private _n_checked = 0;
	@observable private _all_checked = false;
	@observable private _study_type: ''|'watch'|'learn'|'speak' = '';
	@observable private _choosed_word: ''|'watch'|'learn'|'speak' = '';

	private _swiper: Swiper|null = null;
	private _idx: number = -1;
	private _words: IWordData[] = [];
	private _closeWordChoice: _.DebouncedFunc<() => void>;
	private _pages: IWordData[][];

	constructor(props: IVocaList) {
		super(props);
		const words = this.props.actions.getWords();
		this._pages = [];

		for(let i = 0; i < words.length; i++) {
			if(i % 8 === 0) this._pages[this._pages.length] = [];
			this._pages[this._pages.length - 1].push(words[i]);
		}
		this._closeWordChoice = _.debounce(() => {
			this._choosed_word = '';
		}, 2000);
	}

	@action private _onChecked = () => {
		const words = this.props.actions.getWords();

		let cnt = 0;
		for(const word of words) {
			if(word.app_checked) cnt++;
		}

		console.log('onChecked',cnt);
		this._all_checked = (cnt === words.length);
		this._n_checked = cnt;
	}
	
	@action private _onAllChecked = () => {
		App.pub_playBtnTab();
		const words = this.props.actions.getWords();
		this._all_checked = !this._all_checked;

		for(const word of words) {
			word.app_checked = this._all_checked;
		}
		this._n_checked = this._all_checked ? words.length : 0;
	}

	@action private _study(study: ''|'watch'|'learn'|'speak') {
		if(this._n_checked === 0) {
			this._choosed_word = study;
			this._closeWordChoice();
			return;
		}
		while(this._words.length > 0) this._words.pop();

		const words = this.props.actions.getWords();
		for(const word of words) {
			if(word.app_checked) this._words.push(word);
		}
		App.pub_playPopup();
		this._idx = -1;
		this._study_type = study;
	}

	@action private _onStudy = (word: IWordData) => {
		const { actions } = this.props;

		while(this._words.length > 0) this._words.pop();

		const words = actions.getWords();

		let idx = -1;
		for(let i = 0; i < words.length; i++) {
			this._words[i] = words[i];
			if(word === words[i]) idx = i;
		}
		if(idx < 0) idx = 0;

		App.pub_playPopup();
		this._idx = idx;
		this._study_type = 'learn';
	}

	private _onWatch = () => { this._study('watch'); };
	private _onLearn = () => { this._study('learn'); };
	private _onSpeak = () => { this._study('speak'); };

	@action private _onStudyEnd = () => {
		const words = this.props.actions.getWords();

		for(const word of words) {
			word.app_checked = false;
		}
		this._all_checked = false;
		this._n_checked = 0;
		this._idx = -1;
		this._study_type = '';
		this._setNavi();
	}

	private _setNavi() {
		const { actions } = this.props;

		actions.setNaviView(true); //
		actions.setNavi(false, true); //
		actions.setNaviFnc(
			null,
			() => {
				actions.gotoQuizSelect();
			}
		);
	}

	public componentDidUpdate(prev: IVocaList) {
		const { view, actions } = this.props;

		if(view && !prev.view) {
			this._setNavi();
		} else if(!view && prev.view) {
			while(this._words.length) this._words.pop();
			const words = actions.getWords();
			for(const word of words) {
				word.app_checked = false;
			}		
			this._n_checked = 0;
			this._all_checked = false;
			this._idx = -1;
			this._study_type = '';
			this._choosed_word = '';
		}
	}

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;
		this._swiper = el.swiper;
	}

	public render() {
		const { view, state, actions } = this.props;
		const words = actions.getWords();
		const style: React.CSSProperties = {};

		console.log('render',this._n_checked);

		if(!view) {
			style.visibility = 'hidden';
			style.transition = 'visibility 0.3s 0.3s';
		}

		const numOfPage = this._pages.length;
		return (
			<div className="t_voca_list" style={style}>
				<ToggleBtn className="check_all" on={this._all_checked} onClick={this._onAllChecked}/>
				<SwiperComponent ref={this._refSwiper} direction="vertical" scrollbar={{el: '.swiper-scrollbar', draggable: true}} observer={true}>
					{this._pages.map((items, pageIndex) => 
						<div key={pageIndex} className={'box' + (numOfPage < 2 ? ' swiper-no-swiping' : '')}>
							{items.map((word, wordIndex) => 
								<VocaItem 
									key={wordIndex}
									onChecked={this._onChecked}
									word={word}
									onStudy={this._onStudy}
									state={state}
								/>						
							)}
						</div>
					)}
				</SwiperComponent>
				<span className="num"><span className="on">{this._n_checked}</span>/{words.length}</span>
				<div className="btns">
					<ToggleBtn className="watch" onClick={this._onWatch}/>
					<ToggleBtn className="learn" onClick={this._onLearn}/>
					<ToggleBtn className="speak" onClick={this._onSpeak}/>
				</div>					
				<span className={'icon_txtpop ' + this._choosed_word} />
				<StudyPopup onClosed={this._onStudyEnd} words={this._words}	study={this._study_type} idx={this._idx} actions={actions} state={state}/>
			</div>
		);
	}
}

export default VocaList;



