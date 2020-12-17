import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import * as _ from 'lodash';

interface IWrapTextProps {
	className?: string;
	text: JSX.Element;
	minFontSize?: number;
	maxFontSize?: number;
	lineHeight?: number;
	view: boolean;
	rcalcNum?: number;

	disabled?: boolean;
	textAlign?: 'left'|'center'|'right';
	onRef?: (el: HTMLElement) => void;
	onClick?: () => void;
}

@observer
class WrapText extends React.Component<IWrapTextProps> {
	@observable private _width = 0;
	@observable private _recalc = false;

	private _div: HTMLDivElement|null = null;
	private _numOfLine = 0;
	private _fontSize = 0;
	private _lineHeight = 0;
	// private _textAlign: 'left'|'center'|'right' = 'center';

	constructor(props: IWrapTextProps) {
		super(props);
		if(props.maxFontSize && props.minFontSize) this._fontSize = props.maxFontSize;
		if(props.lineHeight) this._lineHeight = props.lineHeight;
	}

	public _ref = (div: HTMLDivElement) => {
		if(this._div || !div) return;
		this._div = div;
		if(this.props.onRef) this.props.onRef(div);
	}

	private _calc = () => {
		const { view, disabled, minFontSize, maxFontSize } = this.props;
		if(!this._div || !view || disabled) return;

		if(this._div.childNodes.length === 0) {
			window.requestAnimationFrame((f) => {
				this._calc();
			});
			return;
		}

		let numLine = 0;
		let middle = -100;
		let left = Number.MAX_SAFE_INTEGER;
		let right = Number.MIN_SAFE_INTEGER;
		let cntIdx = 0;

		this._div.childNodes.forEach((node, idx) => {
			let rightMargin = 0;
			let leftMargin = 0;
			if(node instanceof HTMLElement) {
				const el = node as HTMLElement;
				const computedStyle = window.getComputedStyle(el);
				
				if(computedStyle.position === 'absolute') {
					//
				} 
				else if(computedStyle.display === 'inline') {
					let mr = computedStyle.marginRight ? parseInt(computedStyle.marginRight, 10) : 0;
					let ml = computedStyle.marginLeft ? parseInt(computedStyle.marginLeft, 10) : 0;
					if(isNaN(mr)) mr = 0;
					if(isNaN(ml)) ml = 0;

					const rects = el.getClientRects();

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
						left = Math.min(left, rect.left - ml);
						right = Math.max(right, rect.right + mr);
						cntIdx++;
					}
				
				} else {
					let rect = el.getBoundingClientRect();
					let mr = computedStyle.marginRight ? parseInt(computedStyle.marginRight, 10) : 0;
					let ml = computedStyle.marginLeft ? parseInt(computedStyle.marginLeft, 10) : 0;

					if(isNaN(mr)) mr = 0;
					if(isNaN(ml)) ml = 0;
					rightMargin = mr;
					leftMargin = ml;
				
					if(cntIdx === 0) {
						middle = (rect.top + rect.bottom) / 2;
						numLine = 1;
					} else {
						if(middle < rect.top || middle > rect.bottom) {
							middle = (rect.top + rect.bottom) / 2;
							numLine++;					
						}
					}	
					left = Math.min(left, rect.left - leftMargin);
					right = Math.max(right, rect.right + rightMargin);
					cntIdx++;
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
		if(numLine > 1 || this._recalc) {
			if(maxFontSize && minFontSize) {
				if(this._fontSize !== minFontSize) {
					this._fontSize = minFontSize;
					this._recalc = true;					
					window.requestAnimationFrame((f) => {
						this._calc();
						return;
					});
				} else {
					this._recalc = false;
					this._width = Math.ceil(right - left + 2);
				}
			} else this._width = Math.ceil(right - left + 2);
		} else if(cntIdx > 0) {
			this._width = Math.ceil(right - left + 2);
		}
	}

	private _onClick = () => {
		if(this.props.onClick) this.props.onClick();
	}

	public componentWillReceiveProps(next: IWrapTextProps) {
		const { view,rcalcNum, maxFontSize: maxSize, minFontSize: minSize } = this.props;

		if(next.view !== view ||
			next.rcalcNum !== rcalcNum||
			next.maxFontSize !== maxSize ||
			next.minFontSize !== minSize) {
			this._recalc = false;
			if(next.maxFontSize && next.minFontSize) this._fontSize = next.maxFontSize;
			if(next.lineHeight) this._lineHeight = next.lineHeight;
		}
	}

	public componentDidUpdate(prev: IWrapTextProps) {
		const { view, disabled, rcalcNum, minFontSize, maxFontSize } = this.props;

		if(!this._div) return;

		let maxCnt = -1;
		if(view && !disabled) {		
			if(view !== prev.view) maxCnt = 5;
			// if(this.props.text !== prev.text) bCalc = this.props.view;
			if(rcalcNum !== prev.rcalcNum) maxCnt = 1;

			if(prev.maxFontSize !== maxFontSize) maxCnt = 5;
			if(prev.minFontSize !== minFontSize) maxCnt = 5;
		}

		if( !disabled && (maxCnt >= 0 || (!this._recalc && this._width === 0))) {
			if(maxCnt >= 0) this._recalc = false;
			else maxCnt = 5;

			this._width = 0;
			let cnt  = 0;
			const ff = (f: number) => {
				if(!this._recalc && this._width === 0) {
					if(cnt < maxCnt ) {
						if(maxCnt === 1) {
							this._calc();
							this._width = 0;
						}
						window.requestAnimationFrame(ff);
					} else this._calc();
					
					cnt++;
				}
			};
			ff(-1);
		}
	}

	public componentDidMount() {
		if(!this.props.disabled && !this._recalc && this._width === 0) {
			let cnt  = 0;
			const ff = (f: number) => {
				if(!this._recalc && this._width === 0) {
					if(cnt < 10 ) window.requestAnimationFrame(ff); 
					else this._calc();
				}
				cnt++;
			};
			ff(-1);
		}		
	}

	public render() {
		const {className, text, disabled, textAlign} = this.props;

		let style: React.CSSProperties = {
			display: 'inline-block',
			whiteSpace: 'normal',
			textAlign,
			fontSize: (this._fontSize > 0) ? this._fontSize + 'px' : '',
			lineHeight: (this._lineHeight > 0) ? this._lineHeight + '%' : '',
		};

		if(disabled) {
			style = {
				...style,
				width: '100%',
			};
			if(textAlign) {
				// this._textAlign = style.textAlign = textAlign;
				style.textAlign = (this._numOfLine <= 1) ? 'center' : 'left';
			}
		} else {
			if (this._recalc) {
				style = {
					...style,
					width: '100%',
					textAlign: (this._numOfLine <= 1) ? 'center' : 'left',
				};
				// this._textAlign = style.textAlign;
			}
			else {
				if (this._width > 0) {
					style = {
						...style,
						width: this._width + 'px',
						textAlign: (this._numOfLine <= 1) ? 'center' : 'left',
					};
					// this._textAlign = style.textAlign;
				} else {
					style = {
						...style,
						width: '100%',
						textAlign: 'center',
					};
					// this._textAlign = 'center';
				}
			} 
		}

		return (
			<>
				<div ref={this._ref} className={className} style={style} onClick={this._onClick}>
					{text}
				</div>
			</>
		);
	}
}

export default WrapText;