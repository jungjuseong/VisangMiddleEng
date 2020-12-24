import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

interface IYourturn {
	className: string;
	view: boolean;
	start: boolean;
}

@observer
class Yourturn extends React.Component<IYourturn> {
	private _svg: MYSVGElement|null = null;
	private _className: string;
	constructor(props: IYourturn) {
		super(props);
		this._className = props.className;
	}
	private _refSVG = (svg: SVGElement|null) => {
		if(this._svg || !svg) return;
		this._svg = svg as MYSVGElement;
		this._svg.setCurrentTime(0);
		if(this.props.start && this._svg.animationsPaused()) this._svg.unpauseAnimations();
		else if (!this.props.start && !this._svg.animationsPaused()) this._svg.pauseAnimations();
	}

	public componentWillUpdate(next: IYourturn) {
		const isChange = (this.props.view !== next.view) ||
							(this.props.start !== next.start);

		if(isChange) {
			const arr: string[] = [];
			arr.push(next.className);
			if(!next.view) arr.push('hide');
			this._className = arr.join(' ');
		}	
		
	}
	public componentDidUpdate(prev: IYourturn) {
		if(this.props.start && !prev.start) {
			if(this._svg) {
				this._svg.setCurrentTime(0);
				if (this._svg.animationsPaused()) this._svg.unpauseAnimations();
			}
		} else if(!this.props.start && prev.start) {
			if(this._svg) {
				// this._svg.setCurrentTime(0);
				if (!this._svg.animationsPaused()) this._svg.pauseAnimations();
			}
		}
	}
	public render() {
		return (
			<div className={this._className}>
        {/* <img src= {`${_digenglishCB_lib_}images/yourturn/yourturn.png`}/> */}

<svg ref={this._refSVG} imageRendering="auto" baseProfile="basic" version="1.1" x="0px" y="0px" width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
  <g overflow="visible">
    <g mask="url(#mask_ut)">
      <g opacity="1">
        <animate attributeName="opacity" dur="2.533s" keyTimes="0;.25;1" values="0;1;1" fill="freeze"/>
        <image overflow="visible" xlinkHref={`${_digenglishCB_lib_}images/yourturn/yourturn1.png`} height="100%" width="100%" />
      </g>
    </g>
  </g>
</svg>

			</div>
		);
	}
}

export default Yourturn;

/*

<svg ref={this._refSVG} imageRendering="auto" baseProfile="basic" version="1.1" x="0px" y="0px" width="1040" height="560" viewBox="0 0 1040 560" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
  <defs>
    <g id="u" overflow="visible">
      <image overflow="visible" xlinkHref={`${_digenglishCB_lib_}images/yourturn/star.png`} height="96" width="51" transform="translate(279.5 0)"/>
      <image overflow="visible" xlinkHref={`${_digenglishCB_lib_}images/yourturn/teun.png`} height="84" width="283" transform="translate(0 8.9)"/>
    </g>
    <g id="y" overflow="visible">
      <image overflow="visible" xlinkHref={`${_digenglishCB_lib_}images/yourturn/Your.png`} height="71" width="140"/>
    </g>
  </defs>
  <g id="Scene-1r1" overflow="visible">
    <g>
      <g id=".__EC.__95.__84.__EC.__9D.__B4" transform="translate(348 32)">
        <animateTransform attributeName="transform" additive="replace" type="translate" dur="2.533s" keyTimes="0;.145;.316;.395;.461;1" values="502.5,629;502.5,629;502.5,225.092;502.5,237;502.5,231;502.5,231" keySplines=".5 0 .75 .5;.5 0 .75 .5;0 0 1 1;0 0 1 1;.1 .1 .9 .9" calcMode="spline" fill="freeze"/>
        <animateTransform attributeName="transform" additive="sum" type="scale" dur="2.533s" keyTimes="0;.145;.316;.395;1" values="1,1;1,1;1,1.02;1,1;1,1" keySplines=".5 0 .75 .5;.5 0 .75 .5;0 0 1 1;0 0 1 1" calcMode="spline" fill="freeze"/>
        <animateTransform attributeName="transform" additive="sum" type="translate" dur="2.533s" keyTimes="0;.145;.316;.395;1" values="-154.5,-199;-154.5,-199;-154.5,-199.1;-154.5,-199;-154.5,-199" keySplines=".5 0 .75 .5;.5 0 .75 .5;0 0 1 1;0 0 1 1" calcMode="spline" fill="freeze"/>
        <image overflow="visible" xlinkHref={`${_digenglishCB_lib_}images/yourturn/boy.png`} height="398" width="309"/>
      </g>
      <animate attributeName="display" fill="freeze" repeatCount="1" dur="2.533s" keyTimes="0;.145;1" values="none;inline;inline"/>
    </g>
    <g>
      <g id="uto30d76r1" transform="translate(309.75 383.05)">
        <g>
          <use xlinkHref="#y">
            <animateTransform attributeName="transform" additive="replace" type="translate" dur="2.533s" keyTimes="0;.44699;.553;.645;.697;1" values="70,35.5;70,35.5;69.98,35.485;70.044,35.522;70,35.5;70,35.5" keySplines=".1 .1 .9 .9;.253 .5 .505 1;.5 0 .75 .5;0 0 1 1;.1 .1 .9 .9" calcMode="spline" fill="freeze"/>
            <animateTransform attributeName="transform" additive="sum" type="scale" dur="2.533s" keyTimes="0;.44699;.553;.645;.697;1" values="1,1;1,1;1.155,1.155;.95,.95;1,1;1,1" keySplines=".1 .1 .9 .9;.253 .5 .505 1;.5 0 .75 .5;0 0 1 1;.1 .1 .9 .9" calcMode="spline" fill="freeze"/>
            <animateTransform attributeName="transform" additive="sum" type="translate" dur="2.533s" keyTimes="0;.44699;.553;.645;.697;1" values="-70,-35.5;-70,-35.5;-69.9,-35.4;-70.1,-35.55;-70,-35.5;-70,-35.5" keySplines=".1 .1 .9 .9;.253 .5 .505 1;.5 0 .75 .5;0 0 1 1;.1 .1 .9 .9" calcMode="spline" fill="freeze"/>
          </use>
          <animate attributeName="display" fill="freeze" repeatCount="1" dur="2.533s" keyTimes="0;.395;1" values="none;inline;inline"/>
        </g>
        <g>
          <use xlinkHref="#u" transform="translate(80.25 44.05)">
            <animateTransform attributeName="transform" additive="replace" type="translate" dur="2.533s" keyTimes="0;.52599;.632;.724;.776;1" values="245.5,92.05;245.5,92.05;245.459,92.102;245.482,92.092;245.5,92.05;245.5,92.05" keySplines=".1 .1 .9 .9;.253 .5 .505 1;.5 0 .75 .5;0 0 1 1;.1 .1 .9 .9" calcMode="spline" fill="freeze"/>
            <animateTransform attributeName="transform" additive="sum" type="scale" dur="2.533s" keyTimes="0;.52599;.632;.724;.776;1" values="1,1;1,1;1.155,1.155;.95,.95;1,1;1,1" keySplines=".1 .1 .9 .9;.253 .5 .505 1;.5 0 .75 .5;0 0 1 1;.1 .1 .9 .9" calcMode="spline" fill="freeze"/>
            <animateTransform attributeName="transform" additive="sum" type="translate" dur="2.533s" keyTimes="0;.52599;.632;.724;.776;1" values="-165.25,-48;-165.25,-48;-165.3,-48.1;-165.3,-48.15;-165.25,-48;-165.25,-48" keySplines=".1 .1 .9 .9;.253 .5 .505 1;.5 0 .75 .5;0 0 1 1;.1 .1 .9 .9" calcMode="spline" fill="freeze"/>
          </use>
          <animate attributeName="display" fill="freeze" repeatCount="1" dur="2.533s" keyTimes="0;.395;1" values="none;inline;inline"/>
        </g>
      </g>
      <animate attributeName="display" fill="freeze" repeatCount="1" dur="2.533s" keyTimes="0;.395;1" values="none;inline;inline"/>
    </g>
    <g display="none">
      <g id="utf0r1" transform="translate(309.75 383.05)" opacity="1">
        <animate attributeName="opacity" dur="2.533s" keyTimes="0;.184;1" values="0;1;1" fill="freeze"/>
        <use xlinkHref="#y"/>
        <use xlinkHref="#u" transform="translate(80.25 44.05)"/>
      </g>
      <animate attributeName="display" fill="freeze" repeatCount="1" dur="2.533s" keyTimes="0;.395;1" values="inline;none;none"/>
    </g>
  </g>
</svg>
*/