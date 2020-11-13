import * as _ from 'lodash';

export interface IMsg {
	msgtype: 	'quiz_send'|'quiz_end'|'quiz_return'|
				'script_send'|'dialogue_send'|
				'roll_send'|'shadowing_send'|'dialogue_end'|
				'qna_send'|'qna_return'|'qna_end'|
				'view_clue'|'hide_clue'|
				'focusidx'|'playing'|'paused';
}

export interface IQuizReturn {
	answer: boolean;
	stime: number;
	etime: number;
}

export interface IQuizReturnMsg extends IMsg {
	id: string;
	return : IQuizReturn;
}

export interface IQNAMsg extends IMsg {
	id: string;
	returns: number[];
	stime: number;
	etime: number;
}

export interface IRollMsg extends IMsg {
	roll: 'A'|'B';
}
export interface IFocusMsg extends IMsg {
	idx: number;
}

export interface IReturn {
	num: number;
	users: string[];
}

export interface IQnaReturn {
	num: number;
	users: string[];
}

interface IMultiLang {
	ko: string;
	ja: string; 
	'zh-Hans': string;
	'zh-Hant': string;
	vi: string;
	id: string;
	es: string;
}

interface ISpeaker {
	name: string; 
	image_s: string;
	image_l: string;
}

interface IScCod {
	codType: string;
	codSeq: string;
}

export interface IScript {
	readonly seq: number;
	readonly dms_speaker: string;
	readonly dms_start: number;
	readonly dms_end: number;
	readonly dms_eng: string;
	readonly dms_kor: IMultiLang;
	readonly _sort_idx: number; 
	readonly dms_seq: number;
	qnums: number[]|undefined;
	roll: 'A' | 'B' | 'C' | 'D' |'E';
	app_preview: number;
	sc_COD: IScCod[];
}
export interface IIntroduction {
	readonly seq: number;
	readonly img: string;
	readonly questions: string;
	readonly audio: string;
	readonly ex_answer: string;
}

export interface IConfirmNomal extends IInClassStudyProps{
	readonly seq: number;
	readonly main_sound: string;
	readonly kor_eng: boolean;
	readonly directive: IDirecrive;
	readonly item1: IItem;
	readonly item2: IItem;
	readonly item3: IItem;
	readonly item4: IItem;
	readonly item5: IItem;
	readonly item6: IItem;
}

export interface IDirecrive {
	readonly kor: string;
	readonly eng: string;
	readonly audio: string;
}

export interface IItem {
	readonly answer: number;
	readonly img: string;
}

export interface IData {
	introduction: IIntroduction[];
	confirm_nomal: IConfirmNomal[];
}
