import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import * as _ from 'lodash';

import { ToggleBtn } from '@common/component/button';

import * as common from '../../../common';
import SelectBox from './_select_box';

interface ITableItemProps {
	inview: boolean;
	graphic: common.IAdditionalSup;
	maxWidth: number;
	className: string;
	optionBoxPosition: 'top' | 'bottom';
	disableSelect?: boolean;
	viewResult?: boolean;
	viewCorrect?: boolean;
	onChoice?: (idx: number, choice: number|string, subidx: number) => void;
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

	private _drop = false;
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
		if (this.props.onChoice) this.props.onChoice(this.props.idx,value,idx);
		if (this.props.onChange) this.props.onChange(value, idx);
	}

	private _parseBlock = (
		graphic: common.IAdditionalSup,
		onRef: (sbox: SelectBox, idx: number) => void,
		onChange: (value: string, idx: number) => void,
		boxPositon: 'top' | 'bottom' = 'bottom'
	) => {
		const question = graphic.sentence;
		const arrLine = question.split('<br>');

		let boxIdx = 0;

		const ret = (
			<>
				{arrLine.map((str, idx) => {
					const pattern = new RegExp(/\{(.*?)\}/g);
					let result = pattern.exec(str);
					let lastIdx = 0;
					let sTmp = '';
					let sTmpElmnt: React.ReactFragment;
					const sarr: React.ReactNode[] = [];

					// case1. 문장 안에 select_box 있음.
					while (result) {
						if (result.index > lastIdx) {
							sTmp = str.substring(lastIdx, result.index);
							sTmpElmnt = <span key={this.SELECT_KEY++} dangerouslySetInnerHTML={{ __html: sTmp }} />;
							sarr.push(sTmpElmnt);
						}
						sTmp = result[1];
						if (boxIdx < graphic.app_drops.length) {
							sarr.push(((bIdx: number) =>
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
						} else {
							sarr.push(sTmp);
						}
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
						sarr.push(sTmpElmnt);
					}
					return <li key={idx} className={strAdd}><div>{sarr}</div></li>;
				})}
			</>
		);
		return ret;
	}

	public componentDidMount() {
		while (this._sbox.length > 0) this._sbox.pop();
		console.log('DidMount');
		this._jsx = this._parseBlock(
			this.props.graphic,
			this._refSelect,
			this._onSelect,
			this.props.optionBoxPosition
		);
	}

	public componentWillReceiveProps(next: ITableItemProps) {
		if (next.graphic !== this.props.graphic) {
			while (this._sbox.length > 0) this._sbox.pop();
			this._jsx = this._parseBlock(
				next.graphic,
				this._refSelect,
				this._onSelect,
				this.props.optionBoxPosition
			);
		}
	}

	private _initSBox() {
		const { graphic, disableSelect,viewResult,viewCorrect } = this.props;
		this._sbox.forEach((sbox, idx) => {
			if (sbox) {
				sbox.clear();
				if (idx < graphic.app_drops.length && graphic.app_drops[idx]) {
					sbox.setValue(graphic.app_drops[idx].inputed);
				}
				sbox.setDisableSelect(disableSelect === true);
				sbox.setViewResult(viewResult === true);
				sbox.setViewCorrect(viewCorrect === true);
			}
		});
	}

	private m_swiper?: Swiper;

	private _refSwiper = (el: SwiperComponent) => {
		if (this.m_swiper || !el) return;
		this.m_swiper = el.swiper;
	}

	public componentDidUpdate(prev: ITableItemProps) {
		const { inview,renderCnt,disableSelect,viewResult,viewCorrect } = this.props;
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
		this._cont = (
			<div className="content-box">
				<p>{this.props.idx + 1}</p>
				<div>
					<ul className="content">
						{this._jsx}
					</ul>
				</div>
			</div>
		);
		return (
			<div className={'table-item ' + this.props.className} style={{ maxWidth: this.props.maxWidth + 'px', zIndex: (100 - this.props.idx) }}>
				{this._cont}
				<ToggleBtn className="table-item-btn" view={this.props.viewBtn === true} onClick={this.props.onClickBtn} />
			</div>
		);
	}
}

export default TableItem;