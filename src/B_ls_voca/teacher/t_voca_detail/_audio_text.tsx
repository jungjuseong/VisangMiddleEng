import * as React from 'react';

import { BtnAudio } from '../../../share/BtnAudio';

interface IAudioTextProps {
	audio_url: string;
	audio_className: string;
	text_className: string;
}

function AudioText(props: React.PropsWithChildren<IAudioTextProps>) {
	let _btn: BtnAudio| null = null;
	let _refBtn = (btn: BtnAudio) => {
		if(_btn || !btn) return;
		_btn = btn;
	}
	const _clickText = () => {
		if(!_btn) return;		
		_btn.toggle();
	}
	const {audio_url, audio_className, text_className} = props;
	return (
		<>
			<BtnAudio ref={_refBtn} className={audio_className} url={audio_url}/>
			<div className={text_className} onClick={_clickText}>
				{props.children}
			</div>
		</>
	);
}

export default AudioText;