import * as React from 'react';
import * as _ from 'lodash';

import { BtnAudio } from '../../../share/BtnAudio';
import { ToggleBtn } from '@common/component/button';
import { App } from '../../../App';

import { IStateCtx } from '../t_store';
import { IWordData } from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';

interface IVocaItemProps {
	word: IWordData;
	onStudy: (word: IWordData) => void;
	onChecked: () => void;
	state: IStateCtx;
}

function VocaItem(props: IVocaItemProps) {
	let _btn: BtnAudio | null = null;

	const _refAudio = (btn: BtnAudio) => {
		if(_btn || !btn ) return;
		_btn = btn;
	}

	const _entryClick = () => {
		if(_btn) _btn.toggle();
	}

	const _onChecked = () => {
        App.pub_playBtnTab();
		props.word.app_checked = !props.word.app_checked;
        props.onChecked();
    }
    
	const _onStudy = () => {
        props.onStudy(props.word);
	}

	return (
		<div className={'voca_box' + (props.word.app_studied ? ' click' : '' )}>
			<ToggleBtn className="check" on = {props.word.app_checked} onClick={_onChecked} />
			<div>{`true?false ${props.word.app_checked}`}</div>
			<img src={App.data_url + props.word.thumbnail} draggable={false} onClick={_onChecked}/>
			<div className="voca_btns">
				<ToggleBtn className="btn_study" onClick={_onStudy}/>
				<BtnAudio ref={_refAudio} className="btn_sound" url={App.data_url + props.word.audio}/>
				<div onClick={_entryClick}>
					<WrapTextNew view={props.state.prog >= 'list'} maxLineNum={1} minSize={16} maxSize={40} textAlign="left">
						{props.word.entry}
					</WrapTextNew>
				</div>
			</div>
			<div className="topic_reading">
				<span className={'icon_topic ' + props.word.reading} />				
			</div>	
		</div>
	);
}

export default VocaItem;