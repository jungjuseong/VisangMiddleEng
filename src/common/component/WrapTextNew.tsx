import * as React from 'react';

import { observable } from 'mobx';
import { observer } from 'mobx-react';

import * as _ from 'lodash';
import ReactResizeDetector from 'react-resize-detector';

interface IWrapText {
	className?: string;
	view: boolean;
	maxFontSize?: number;
	minFontSize?: number;
	lineHeight?: number;
	maxLineNum?: number; // minSize로 바꿀 최대 라인 수
	textAlign?: 'left'|'center'|'right';
	rcalcNum?: number;
	viewOnInit?: boolean;
	onRef?: (el: HTMLElement) => void;
	onClick?: (evt?: React.MouseEvent<HTMLElement>) => void;
}

@observer
class WrapTextNew extends React.Component<IWrapText> {
	@observable private _width = 0;
	@observable private _fontSize = 0;

	private _div: HTMLDivElement|null = null;
	private _myWidth = 0;
	private _numOfLine = 0;

	constructor(props: IWrapText) {
		super(props);
		this._fontSize = this.props.maxFontSize ? this.props.maxFontSize : 0;
	}

	public _ref = (div: HTMLDivElement) => {
		const {onRef} = this.props;

		if(this._div || !div) return;
		this._div = div;
		if(onRef) onRef(div);
	}

	private _canCalc = () => (this.props.view && this._myWidth > 0 && this._div && this._width <= 0);
	
	private _aniFrame = (f: number) => {
		if(this._canCalc()) {
			this._calc();
			window.requestAnimationFrame(this._aniFrame);
		}
	}

	private getComputedMargin = (computedStyle: CSSStyleDeclaration) => {
		let computedMarginRight = computedStyle.marginRight ? parseInt(computedStyle.marginRight, 10) : 0;
		let computedMarginLeft = computedStyle.marginLeft ? parseInt(computedStyle.marginLeft, 10) : 0;
		
		if(isNaN(computedMarginRight)) computedMarginRight = 0;
		if(isNaN(computedMarginLeft)) computedMarginLeft = 0;

		return ({ 
			left: computedMarginLeft,
			right: computedMarginRight
		});
	}

	private _calc() {
		const { maxLineNum, minFontSize } = this.props;
		
		if(!this._canCalc() || !this._div) return;

		const boundingRect = this._div.getBoundingClientRect();
		const gapWidth = (this._myWidth - boundingRect.width);

		if(gapWidth < -1 || gapWidth > 1 ||
			this._div.childNodes.length === 0) return;
		
		let numLine = 0;

		let middle = -100;
		let left = Number.MAX_SAFE_INTEGER;
		let right = Number.MIN_SAFE_INTEGER;
		let cntIdx = 0;

		this._div.childNodes.forEach((node, idx) => {
			let marginR = 0;
			let marginL = 0;
			if(node instanceof HTMLElement) {
				const el = node as HTMLElement;
				const computedStyle = window.getComputedStyle(el);
				let computedMargin = this.getComputedMargin(computedStyle);

				const clientRects = el.getClientRects();
				if(computedStyle.position === 'absolute') {
					//
				} else if(computedStyle.display === 'inline') {

					for(let i = 0; i < clientRects.length; i++) {
						const rect = clientRects.item(i);
						if(!rect) continue;
					
						if(cntIdx === 0) {
							middle = (rect.top + rect.bottom) / 2;
							numLine = 1;
						} else {
							if(middle < rect.top || middle > rect.bottom) {
								middle = (rect.top + rect.bottom) / 2;
								numLine++;					
							}
						}					
						left = Math.min(left, rect.left - computedMargin.left);
						right = Math.max(right, rect.right + computedMargin.right);
						cntIdx++;
					}				
				} else {
					let rect = el.getBoundingClientRect();

					marginR = computedMargin.right;
					marginL = computedMargin.left;
	
					if(rect.bottom - rect.top > 0) {
						if(cntIdx === 0) {
							middle = (rect.top + rect.bottom) / 2;
							numLine = 1;
						} else {
							if(middle < rect.top || middle > rect.bottom) {
								middle = (rect.top + rect.bottom) / 2;
								numLine++;					
							}
						}		
						left = Math.min(left, rect.left - marginL);
						right = Math.max(right, rect.right + marginR);
						cntIdx++;
					}
				}
			} else {
				const range = document.createRange();
				range.selectNodeContents(node);

				const rects = range.getClientRects();
				for(let i = 0; i < rects.length; i++) {
					const rect = rects.item(i);
					if(!rect) continue;
				
					if(cntIdx === 0) {
						middle = (rect.top + rect.bottom) / 2;
						numLine = 1;
					} else {
						if(middle < rect.top || middle > rect.bottom) {
							middle = (rect.top + rect.bottom) / 2;
							numLine++;					
						}
					}	
					left = Math.min(left, rect.left);
					right = Math.max(right, rect.right);
					cntIdx++;
				}
			}	
		});
		this._numOfLine = numLine;

		let real_maxLineNum = maxLineNum ? maxLineNum : 1;
		if(real_maxLineNum < 1) real_maxLineNum = 1;

		if(numLine > real_maxLineNum) {
			const minSize = minFontSize ? minFontSize : 0;
			if(this._fontSize > 0 && minSize > 0 && this._fontSize > minSize) {
				this._fontSize--;
			} else this._width = Math.ceil(right - left + 2);
		} else if(cntIdx > 0) {
			this._width = Math.ceil(right - left + 2);
		}
	}

	private _resized = (width: number, h: number) => {
		this._myWidth = width;
		window.requestAnimationFrame(this._aniFrame);
	}

	public componentDidUpdate(prev: IWrapText) {
		const { view, rcalcNum, maxFontSize } = this.props;

		if(view && !prev.view) {
			this._fontSize = maxFontSize ? maxFontSize : 0;
			this._width = 0;
			window.requestAnimationFrame(this._aniFrame);
		} else if(!view && prev.view) this._width = 0;
		
		if(view && rcalcNum && rcalcNum !== prev.rcalcNum) {
			this._fontSize = maxFontSize ? maxFontSize : 0;
			this._width = 0;
			window.requestAnimationFrame(this._aniFrame);
		}
		if(this._fontSize === 0 && maxFontSize) this._fontSize = maxFontSize;
	}

	public render() {
		const {className} = this.props; 
		const style: React.CSSProperties = {
			whiteSpace: 'normal',
		};
		// console.log('render', this._fontSize);
		if(this._fontSize > 0) style.fontSize = this._fontSize + 'px';
		if(this.props.lineHeight) style.lineHeight = this.props.lineHeight + '%';

		// console.log(' render', this._fontSize);

		let textAlign: 'left'|'center'|'right';
		if(this._width > 0) {
			style.width = this._width + 'px';
			style.display = 'inline-block';

			
			if(this.props.textAlign) textAlign = this.props.textAlign;
			else if(this._numOfLine <= 1) textAlign = 'center';
			else textAlign = 'left';

			style.textAlign = textAlign;
		} else {
			style.width = '100%';
			style.display = 'inline-block';
			if(!this.props.viewOnInit) style.opacity = 0.01;

			if(this.props.textAlign) textAlign = this.props.textAlign;
			else if(this._numOfLine <= 1) textAlign = 'center';
			else textAlign = 'left';

			style.textAlign = textAlign;
		}
		return (
			<>
				<div ref={this._ref} className={className} style={style} onClick={this.props.onClick}>
					{this.props.children}
					<ReactResizeDetector handleWidth={true} handleHeight={true} onResize={this._resized}/>
				</div>
			</>
		);

	}

}

export default WrapTextNew;