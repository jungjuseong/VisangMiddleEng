import * as React from 'react';
import * as _ from 'lodash';
import * as kutil from '@common/util/kutil';
import * as style from './style';

interface IVideoDirectionProps {
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

const VideoDirection: React.FC<IVideoDirectionProps> = (props) => {
	const {on, className, view,video_url,isTeacher,onEndStart, onEnd} = props;
	const [ _enabled, setEnabled ] = React.useState(view && on);
	const [ _clipView, setClipView ] = React.useState(false);
	
	let m_imgDiv: HTMLImageElement|null = null;

	const _imageRef = (el: HTMLImageElement) => {
		if(!el || video_url === undefined || video_url === '') return;
		m_imgDiv = el;

		if(!_clipView) {
			_.delay(() => {
				if(m_imgDiv) setClipView(true);
			}, 1250);
		}
	};

	let _onClick = () => { if (isTeacher) _setOff(); };
	
	const _setOff = async () => {
		if(view && _enabled) {
			setEnabled(false);
			if(onEndStart) onEndStart();
			await kutil.wait(500);

			if(view && !_enabled) {
				if(onEnd) onEnd();
			}

		}
	};
	const _setOn = async () => setEnabled(true);
	
	React.useEffect(() => {
		if(view) {			
			if(on) _setOn();
			else setEnabled(false);			
		} else {
			setEnabled(false);
		}
	}, [view, on]);

	const arr: string[] = [];
	arr.push(className);
	
	if(view) {
		if(_enabled) arr.push('on');
	} else {
		arr.push('hide');
	}
	return (
		<div className={arr.join(' ')} onClick={_onClick}>
			{props.children}
			<img className="movieclip" src={video_url} ref={_imageRef} style={_clipView ? undefined : style.HIDE}/>
			<div className="direction"/>
		</div>
	);
};

export default VideoDirection;