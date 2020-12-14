import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import * as _ from 'lodash';

import { ToggleBtn } from '@common/component/button';

import { IAdditionalSup } from '../../../../common';
import SelectBox from './_select_box';

const SwiperComponent = require('react-id-swiper').default;

let _zIndex = observable([0]);

interface ITableItemProps {
	inview: boolean;
	graphic: IAdditionalSup;
	maxWidth: number;
	className: string;
	optionBoxPosition: 'top' | 'bottom';
	disableSelect?: boolean;
	viewResult?: boolean;
	viewCorrect?: boolean;
	onChange?: (value: string, idx: number) => void;
	viewBtn?: boolean;
	renderCnt?: number;
	onClickBtn?: () => void;
	idx: number;
}

@inject()
@observer
class TableItem extends React.Component<ITableItemProps> {
	@observable private m_view = false;

	private _jsx!: JSX.Element;
	private SELECT_KEY = 0;
	private _cont!: JSX.Element;
	private _sbox: SelectBox[] = [];
	private _totalNumOfSentnc: number = 0;

	@observable private _opt = true;

	constructor(props: ITableItemProps) {
		super(props);
		const { sentence1, sentence2, sentence3, sentence4 } = props.graphic;
		const answerList = [sentence1.answer, sentence2.answer, sentence3.answer, sentence4.answer];
		for (let i = 0; i < answerList.length; i++) {
			if (answerList[i] === undefined || answerList[i] === 0) return;
			this._totalNumOfSentnc++;
		}
	}

	private _refSelect = (sbox: SelectBox, idx: number) => {
		if (this._sbox[idx] || !sbox || idx < 0) return;
		this._sbox[idx] = sbox;
		this._initSBox();
	}

	private _onSelect = (value: string, idx: number) => {
		const drops = this.props.graphic.app_drops;
		if (idx < drops.length && drops[idx]) {
			drops[idx].inputed = value;
		}
		if (this.props.onChange) this.props.onChange(value, idx);
	}

	private _parseBlock = (graphic: IAdditionalSup,	onRef: (sbox: SelectBox, idx: number) => void, onChange: (value: string, idx: number) => void,boxPositon: 'top' | 'bottom' = 'bottom') => {
		const question = graphic.sentence;
		const arrLine = question.split('<br>');
		return (
			<>
				{arrLine.map((str, idx) => {
					const pattern = new RegExp(/\{(.*?)\}/g);
					let result = pattern.exec(str);
					let lastIdx = 0;
					let sTmp = '';
					let sTmpElmnt: React.ReactFragment;
					const s_arr: React.ReactNode[] = [];

					// case1. 문장 안에 select_box 있음.
					let boxIdx = 0;
					while (result) {
						if (result.index > lastIdx) {
							sTmp = str.substring(lastIdx, result.index);
							sTmpElmnt = <span key={this.SELECT_KEY++} dangerouslySetInnerHTML={{ __html: sTmp }} />;
							s_arr.push(sTmpElmnt);
						}
						sTmp = result[1];
						if (boxIdx < graphic.app_drops.length) {
							s_arr.push(((bIdx: number) =>
								<SelectBox
									key={this.SELECT_KEY++}
									ref={(sbox: SelectBox) => onRef(sbox, bIdx)}
									text={sTmp}
									correct={graphic.app_drops[bIdx].correct}
									options={graphic.app_drops[bIdx].choices}
									boxPositon={boxPositon}
									onChange={(value: string) => onChange(value, bIdx)}
									idx={this.props.idx}
									className={this.props.className}
									totalStncNum={this._totalNumOfSentnc}
									sentncNum={bIdx}
									isStudent={false}
								/>
							)(boxIdx));
							boxIdx++;
						} else s_arr.push(sTmp);						
						lastIdx = pattern.lastIndex;
						result = pattern.exec(str);
					}

					// case2. 문장 안에 select_box 없음.
					let strAdd = ''; // Total예외
					if (lastIdx < str.length) {
						sTmp = str.substring(lastIdx);

						if (sTmp.indexOf('_add_') >= 0) {
							strAdd = 'add';
							sTmpElmnt = <span key={this.SELECT_KEY++} dangerouslySetInnerHTML={{ __html: sTmp.split('_add_')[1] }} />;
						} else {
							sTmpElmnt = <span key={this.SELECT_KEY++} dangerouslySetInnerHTML={{ __html: sTmp }} />;
						}
						s_arr.push(sTmpElmnt);
					}
					return <li key={idx} className={strAdd}><div>{s_arr}</div></li>;
				})}
			</>
		);
	}

	public componentDidMount() {
		while (this._sbox.length > 0) this._sbox.pop();
		console.log('didmount');
		this._jsx = this._parseBlock(this.props.graphic,this._refSelect,this._onSelect,	this.props.optionBoxPosition);
	}
	public componentWillReceiveProps(next: ITableItemProps) {
		if (next.graphic !== this.props.graphic) {
			while (this._sbox.length > 0) this._sbox.pop();
			this._jsx = this._parseBlock(next.graphic,this._refSelect,this._onSelect,this.props.optionBoxPosition);
		}
	}

	private _initSBox() {
		const drops = this.props.graphic.app_drops;
		this._sbox.forEach((sbox, idx) => {
			if (sbox) {
				sbox.clear();
				if (idx < drops.length && drops[idx]) {
					sbox.setValue(drops[idx].inputed);
				}
				sbox.setDisableSelect(this.props.disableSelect === true);
				sbox.setViewResult(this.props.viewResult === true);
				sbox.setViewCorrect(this.props.viewCorrect === true);
			}
		});
	}

	private m_swiper?: Swiper;

	private _refSwiper = (el: SwiperComponent) => {
		if (this.m_swiper || !el) return;
		this.m_swiper = el.swiper;
	}

	public componentDidUpdate(prev: ITableItemProps) {
		const { inview,renderCnt,disableSelect,viewResult, viewCorrect } = this.props;

		if (inview && !prev.inview) {
			if (this.m_swiper) {
				this.m_swiper.slideTo(0, 0);
				_.delay(() => {
					if (this.m_swiper) {
						this.m_swiper.update();
						if (this.m_swiper.scrollbar) this.m_swiper.scrollbar.updateSize();

						const _slide = this.m_swiper.wrapperEl.children[0].clientHeight;
						if (_slide <= this.m_swiper.height) this._opt = true;
						else this._opt = false;
					}
				}, 100);
			}
		}

		if (inview && !prev.inview) {
			this._initSBox();
		}
		if (renderCnt !== prev.renderCnt) {
			this._initSBox();
		}

		if (disableSelect !== prev.disableSelect) {
			this._sbox.forEach((sbox, idx) => {
				if (sbox) {
					sbox.setDisableSelect(disableSelect === true);
				}
			});
		}
		/* TO DO
		if(this.props.value !== prev.value) {
			if(this._sbox) {
				this._sbox.setValue(this.props.value);
			}
		}
		*/
		if (viewResult !== prev.viewResult) {
			this._sbox.forEach((sbox, idx) => {
				if (sbox) {
					sbox.setViewResult(viewResult === true);
				}
			});
		}
		if (viewCorrect !== prev.viewCorrect) {
			this._sbox.forEach((sbox, idx) => {
				if (sbox) {
					sbox.setViewCorrect(viewCorrect === true);
				}
			});
		}
	}

	public render() {	
		const { maxWidth, viewBtn, onClickBtn, idx, className} = this.props;
		this._cont = (
			<div className="content-box">
				<div>
					<ul className="content">{this._jsx}</ul>
				</div>
			</div>
		);
		return (
			<div className={'table-item ' + className} style={{ maxWidth: maxWidth + 'px', zIndex: (100 - idx) }}>
				{this._cont}
				<ToggleBtn className="table-item-btn" view={viewBtn === true} onClick={onClickBtn} />
			</div>
		);
	}
}

export default TableItem;