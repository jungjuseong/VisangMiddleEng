import * as _ from 'lodash';

export interface IMsg {
	msgtype:	'confirm_send'|'confirm_end'|'confirm_return'|
				'additional_send'|'additional_end'|'additional_return'|
				'dictation_send'|'dictation_end'|'dictation_return'|
				'script_send'|'script_end'|'script_return';
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

export interface IConfirmSup extends IInClassStudyProps{
	readonly seq: number;
	readonly main_sound: string;
	readonly kor_eng: boolean;
	readonly directive: IDirecrive;
	readonly problem1: IProblemSup;
	readonly problem2: IProblemSup;
	readonly problem3: IProblemSup;
}

export interface IConfirmHard extends IInClassStudyProps{
	readonly seq: number;
	readonly main_sound: string;
	readonly kor_eng: boolean;
	readonly directive: IDirecrive;
	readonly problem1: IProblemHard;
	readonly problem2: IProblemHard;
	readonly problem3: IProblemHard;
	readonly problem4: IProblemHard;
}

export interface IAdditional extends IInClassStudyProps{
	readonly seq: number;
	readonly main_sound: string;
	readonly kor_eng: boolean;
	readonly directive: IDirecrive;
	readonly table_title: number;
	readonly sentence : string;
}

export interface IAdditionalBasic extends IAdditional{
	readonly sentence_answer1:string;
	readonly sentence_answer2:string;
	readonly sentence_answer3:string;
	readonly sentence_answer4:string;
}

export interface IAdditionalSup extends IAdditional{
	readonly sentence1:ISentenceSup;
	readonly sentence2:ISentenceSup;
	readonly sentence3:ISentenceSup;
	readonly sentence4:ISentenceSup;

	app_drops: IDropDown[];
}
export interface IAdditionalHard extends IAdditional{
	readonly sentence1:ISentenceHard;
	readonly sentence2:ISentenceHard;
	readonly sentence3:ISentenceHard;
	readonly sentence4:ISentenceHard;
}

export interface IDictation extends IInClassStudyProps{
	readonly seq: number;
	readonly main_sound: string;
	readonly kor_eng: boolean;
	readonly directive: IDirecrive;
	readonly table_title: number;
	readonly sentence : string;
	readonly sentence1:ISentenceDic;
	readonly sentence2:ISentenceDic;
	readonly sentence3:ISentenceDic;
	readonly sentence4:ISentenceDic;
}

export interface IDropDown {
	answer: number;
	correct: string;
	choices: string[];
	inputed: string;
}

export interface ISentenceDic{
	readonly answer1 : string;
	readonly answer2 : string;
	readonly answer3 : string;
	readonly answer4 : string;
}

export interface ISentenceSup{
	readonly answer : number;
	readonly choice1 : string;
	readonly choice2 : string;
	readonly choice3 : string;
	readonly choice4 : string;
}

export interface ISentenceHard{
	readonly answer1 : string;
	readonly answer2 : string;
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

export interface IProblem {
	readonly question: string;
	readonly question_audio: string;
}

export interface IProblemSup extends IProblem{
	readonly answer: number;
	readonly choice1 : string;
	readonly choice2 : string;
}

export interface IProblemHard extends IProblem{
	readonly answer: string;
	readonly hint : string;
}

export interface IData {
	introduction: IIntroduction[];
	confirm_nomal: IConfirmNomal[];
	confirm_sup: IConfirmSup[];
	confirm_hard: IConfirmHard[];
	additional_basic: IAdditionalBasic[];
	additional_sup: IAdditionalSup[];
	additional_hard: IAdditionalHard[];
	dictation_sup: IDictation[];
	dictation_basic: IDictation[];
	dictation_hard: IDictation[];
}

function _getDrops(answer: number, c1: string, c2: string, c3: string, c4: string) {
	if(!answer || answer <= 0 || answer > 4) return;
	const ret: IDropDown = {
		answer,
		correct: '',
		choices: [],
		inputed: '',
	};

	if(answer === 1) ret.correct = c1;
	else if(answer === 2) ret.correct = c2;
	else if(answer === 3) ret.correct = c3;
	else if(answer === 4) ret.correct = c4;

	if(!ret.correct || ret.correct === '') return null;

	if(c1 && c1 !== '') ret.choices[0] = c1;
	else return null;

	if(c2 && c2 !== '') ret.choices[1] = c2;
	else return null;

	if(c3 && c3 !== '') ret.choices[2] = c3;
	else return ret;

	if(c4 && c4 !== '') ret.choices[3] = c4;



	return ret;
}
export function initData(data: IData) {

	for(let i = 0; i < data.additional_sup.length; i++) {
		const grap = data.additional_sup[i];

		grap.app_drops = [];

		let drop = _getDrops(grap.sentence1.answer, grap.sentence1.choice1, grap.sentence1.choice2, grap.sentence1.choice3, grap.sentence1.choice4);
		if(drop) grap.app_drops[0] = drop;
		else continue;

		drop = _getDrops(grap.sentence2.answer, grap.sentence2.choice1, grap.sentence2.choice2, grap.sentence2.choice3, grap.sentence2.choice4);
		if(drop) grap.app_drops[1] = drop;
		else continue;

		drop = _getDrops(grap.sentence3.answer, grap.sentence3.choice1, grap.sentence3.choice2, grap.sentence3.choice3, grap.sentence3.choice4);
		if(drop) grap.app_drops[2] = drop;
		else continue;

		drop = _getDrops(grap.sentence4.answer, grap.sentence4.choice1, grap.sentence4.choice2, grap.sentence4.choice3, grap.sentence4.choice4);
		if(drop) grap.app_drops[3] = drop;
		else continue;
	}

	return data;
}