import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import * as kutil from '@common/util/kutil';
import * as style from './style';

interface IVideoDirection {
	className: string;
	view: boolean;
	on: boolean;
	isTeacher: boolean;
	video_url: string;
	video_frame: number;
	onEnd?: () => void;
	onEndStart?: () => void;
	category?: string;
	title?: string;
	
}


@observer
class VideoDirection extends React.Component<IVideoDirection> {
	@observable private m_on = false;
    // @observable private m_frame = 0;
    
    @observable private m_clipView = false;
    private m_imgDiv: HTMLImageElement|null = null;

	constructor(props: IVideoDirection) {
		super(props);
		this.m_on = props.view && props.on;
    }
    private _refImg = (el: HTMLImageElement) => {
        if(!el) return;
        else if(this.props.video_url === undefined) return;
        else if(this.props.video_url === '') return;

        this.m_imgDiv = el;

        if(!this.m_clipView) {
            _.delay(() => {
                if(this.m_imgDiv) this.m_clipView = true;
            }, 1250);
        }
    }
	private _onClick = () => {
		if(this.props.isTeacher) this._off();
	}
	@action private _off = async () => {
		if(this.props.view && this.m_on) {
			this.m_on = false;
			/*
			if(this.m_video ) {
				if(!this.m_video.paused) this.m_video.pause();
			}
			*/
			if(this.props.onEndStart) this.props.onEndStart();
			await kutil.wait(500);

			if(this.props.view && !this.m_on) {
				if(this.props.onEnd) this.props.onEnd();
				// this.m_frame = 0;
				// if(this.m_video ) this.m_video.currentTime = 0;
			}

		}
	}
	private async _on() {
		// this.m_frame = 0;
		this.m_on = true;
	}
	public componentDidUpdate(prev: IVideoDirection) {
		if(this.props.view) {
			if(!prev.view) {
				if(this.props.on) this._on();
				else this.m_on = false;
				
			} else if(this.props.on && !prev.on) this._on();
			else if (!this.props.on && prev.on) this._off();
		} else {
			// this.m_frame = 0;
			this.m_on = false;
		}
	}

	/*
	private _onCanPlay = () => {
		if(!this.m_video) return;
		if(!this.m_loaded) {
			this.m_video.currentTime = 0;
			this.m_loaded = true;
		}
		// console.log('_onCanPlay', this.m_video.paused);
	}
	private _onPlay = () => {
		if(!this.m_video) return;
		if(!this.m_loaded) {
			this.m_video.currentTime = 0;
			this.m_loaded = true;
		}
		// console.log('_onPlay', this.m_video.paused);
	}
	*/
	public render() {
		const arr: string[] = [];
		arr.push(this.props.className);
		if(this.props.view) {
			if(this.m_on) arr.push('on');
		} else {
			arr.push('hide');
		}
		return (
			<div className={arr.join(' ')} onClick={this._onClick}>
				{this.props.children}
				{/* <img className="movieclip" src={this.props.video_url}/> */}
                <img className="movieclip" src={this.props.video_url} ref={this._refImg} style={this.m_clipView ? undefined : style.HIDE}/>
				{/*
				<MovieClip
					className="movieclip"
					view={this.props.view}
					totalFrames={this.props.video_frame}
					url={this.props.video_url}
					bPlay={this.m_on}
				/>
				<video
					ref={this._refVideo} 
					src={this.props.video_url}
					preload="auto"
					autoPlay={false}
					controls={false}
					onCanPlay={this._onCanPlay}
					onCanPlayThrough={this._onCanPlay}
					onPlay={this._onPlay}
					onPlaying={this._onPlaying}
				/>
				*/}
				<div className="direction"/>
			</div>
		);
	}
}

export default VideoDirection;