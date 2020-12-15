import * as _ from 'lodash';


export type COLOR = 'pink'|'green'|'orange'|'purple';

interface IRGBA {
	r: number;
	g: number;
	b: number;
	a: number;
}

export interface IMsg {
	msgtype:	'confirm_send'|'confirm_end'|'confirm_return'|
				'additional_send'|'additional_end'|'additional_return'|
				'dictation_send'|'dictation_end'|'dictation_return'|
				'script_send'|'script_end'|'script_return'|'playing'|'paused'|'focusidx'|'qna_send'|'qna_end'|'shadowing_send'|'roll_send'|'qna_return';
}

export interface IIndexMsg extends IMsg {
	idx: number;
}

export interface IConfirmHardMsg extends IIndexMsg {
	hint: boolean;
}

export interface IQuizReturn {
	answer1: number;
	answer2: number;
	answer3: number;
}

export interface IQuizStringReturn {
	answer1: string;
	answer2: string;
	answer3: string;
}

export interface IRollMsg extends IIndexMsg {
	roll: 'A'|'B';
}

export interface IQuizReturnMsg extends IIndexMsg {
	id: string;
	returns: IQuizReturn;
}

export interface IQuizUrlReturnMsg extends IQuizReturnMsg{
	imgUrl : string;
}

export interface IAdditionalQuizReturnMsg extends IIndexMsg {
	id: string;
	returns: IQuizStringReturn[];
}

export interface IQuizStringReturnMsg extends IIndexMsg {
	id: string;
	returns: IQuizStringReturn;
}

export interface IQNAMsg extends IIndexMsg {
	id: string;
	returns: number[];
	stime: number;
	etime: number;
}

export interface IFocusMsg extends IIndexMsg {
	fidx: number;
}

export interface IReturn {
	num: number;
	users: string[];
}

export interface IQnaReturn {
	num: number;
	users: string[];
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
	readonly script_group: number;
	readonly coordinate_num: number;
	readonly start: number;
	readonly end: number;
	readonly audio_start: number;
	readonly audio_end: number;
	readonly speaker: string; 
	readonly dms_eng: string;
	readonly dms_kor: string;
	readonly dms_seq: number;
	roll: 'A' | 'B' | 'C' | 'D' |'E';
}
export interface IIntroduction {
	readonly seq: number;
	readonly img: string;
	readonly questions: string;
	readonly audio: string;
	readonly ex_answer: string;
}

export interface IConfirmNomal extends IInClassStudyProps {
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

export interface IConfirmSup extends IInClassStudyProps {
	readonly seq: number;
	readonly main_sound: string;
	readonly kor_eng: boolean;
	readonly directive: IDirecrive;
	readonly problem1: IProblemSup;
	readonly problem2: IProblemSup;
	readonly problem3: IProblemSup;
	readonly problem4: IProblemSup;
}

export interface IConfirmHard extends IInClassStudyProps {
	readonly seq: number;
	readonly main_sound: string;
	readonly kor_eng: boolean;
	readonly directive: IDirecrive;
	readonly problem1: IProblemHard;
	readonly problem2: IProblemHard;
	readonly problem3: IProblemHard;
	readonly problem4: IProblemHard;
}

export interface IAdditional extends IInClassStudyProps {
	readonly seq: number;
	readonly main_sound: string;
	readonly kor_eng: boolean;
	readonly directive: IDirecrive;
	readonly table_title: number;
	readonly sentence: string;
}

export interface IAdditionalBasic extends IAdditional {
	readonly sentence_answer1: string;
	readonly sentence_answer2: string;
	readonly sentence_answer3: string;
	readonly sentence_answer4: string;
}

export interface IAdditionalSup extends IAdditional {
	readonly sentence1: ISentenceSup;
	readonly sentence2: ISentenceSup;
	readonly sentence3: ISentenceSup;
	readonly sentence4: ISentenceSup;

	app_drops: IDropDown[];
}
export interface IAdditionalHard extends IAdditional {
	readonly sentence1: ISentenceHard;
	readonly sentence2: ISentenceHard;
	readonly sentence3: ISentenceHard;
	readonly sentence4: ISentenceHard;
}

export interface IDictation extends IInClassStudyProps {
	readonly seq: number;
	readonly main_sound: string;
	readonly kor_eng: boolean;
	readonly directive: IDirecrive;
	readonly table_title: number;
	readonly sentence: string;
	readonly sentence1: ISentenceDic;
	readonly sentence2: ISentenceDic;
	readonly sentence3: ISentenceDic;
	readonly sentence4: ISentenceDic;
}

export interface IDropDown {
	answer: number;
	correct: string;
	choices: string[];
	inputed: string;
}

export interface ISentenceDic {
	readonly answer1: string;
	readonly answer2: string;
	readonly answer3: string;
	readonly answer4: string;
}

export interface ISentenceSup {
	readonly answer: number;
	readonly choice1: string;
	readonly choice2: string;
	readonly choice3: string;
	readonly choice4: string;
}

export interface ISentenceHard {
	readonly answer1: string;
	readonly answer2: string;
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

export interface IProblemSup extends IProblem {
	readonly answer: number;
	readonly choice1: string;
	readonly choice2: string;
	readonly choice3: string;
	readonly choice4: string;
}

export interface IProblemHard extends IProblem {
	readonly answer: string;
	readonly hint: string;
}

export interface IRolePlay {
	readonly main_sound: string;
	readonly video_start: number;
	speakerA: ISpeaker;
	speakerB: ISpeaker;
	speakerC: ISpeaker;
	speakerD: ISpeaker;
	speakerE: ISpeaker;
}

interface ISpeaker {
	name: string; 
	image_s: string;
	image_l: string;
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
	script: IScript[];
	scripts: IScript[][];
	role_play: IRolePlay;
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
	let cnum = -1;
	let arr: IScript[] = [];
	data.scripts = [];
	for(let i = 0; i < data.script.length; i++) {
		const grap = data.script[i];
		if(grap.script_group !== cnum) {
			if(cnum !== -1) {
				data.scripts.push(arr);
			}
			cnum = grap.script_group;
			arr = [];
		}
		arr.push(grap);
	}
	data.scripts.push(arr);

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

const _pink = _RGBA(206, 116, 225, 1);
const _green = _RGBA(34,205,172, 1);
const _orange = _RGBA(255, 186, 0, 1);
const _purple = _RGBA(116,113,236, 1);

function _RGBA(r: number, g: number, b: number, a: number) {
	return {r, g, b, a};
}
function _rgbaToString(rgba: IRGBA) {
	const {r, g, b, a} = rgba;
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}
export function drawBalloon(
	ctx: CanvasRenderingContext2D, 
	x: number, 
	y: number, 
	w: number, 
	h: number, 
	px: number,
	py: number, 
	r: number,
	shadowX?: number,
	shadowY?: number,
	shadowBlur?: number,
	shadowColor?: IRGBA,
) {
	const color = 'green';
	let vgap;
	if(px < x) vgap = (x - px) * 1.5;
	else vgap = (px - (x + w)) * 1.5;
	if(!shadowX) shadowX = 0;
	if(!shadowY) shadowY = 5;
	if(!shadowBlur) shadowBlur = 2;

	if(!shadowColor) shadowColor = _RGBA(0, 0, 0, 0.2);


	const bShadow = ((
			shadowX > 0 || shadowX < 0 || 
			shadowY > 0 || shadowY < 0 || 
			shadowBlur > 0
		) && shadowColor.a > 0);

	let bgColor;
	if(color === 'green') bgColor = _green;
	else if(color === 'orange') bgColor = _orange;
	else if(color === 'purple') bgColor = _purple;
	else bgColor = _pink;

	bgColor.a = 1;
	ctx.lineCap = 'butt';
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'transparent';
	ctx.fillStyle = _rgbaToString(bgColor);

	const gradient_BG = ctx.createLinearGradient(0, 0, 0, h);
	gradient_BG.addColorStop(0, 'rgba(255, 255, 255, 1)');
	gradient_BG.addColorStop(1, 'rgba(255, 255, 255, 0)');

	const gradient = ctx.createLinearGradient(0, 0, 0, h);
	bgColor.a = 0.4;
	gradient.addColorStop(0, _rgbaToString(bgColor));
	bgColor.a = 1;
	gradient.addColorStop(1, _rgbaToString(bgColor));


	ctx.beginPath();
	/* 우측 하단 라운드 */
	ctx.moveTo(x + w, y + h - r);
	if(r > 0) ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
	
	/* 하단 선, 좌측 하단 라운드 */
	ctx.lineTo(x + r, y + h);
	if (r > 0) ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);

	/* 좌측 선(꼭지점), 좌측 상단 라운드 */
	if(px < x) {
		ctx.lineTo(x, py + vgap / 2);
		ctx.lineTo(px, py);
		ctx.lineTo(x, py - vgap / 2);
	}
	ctx.lineTo(x, y + r);

	
	if (r > 0) ctx.arc(x + r, y + r, r, Math.PI , 3 * Math.PI / 2);

	/* 상단 선, 우측 상단 라운드 */
	ctx.lineTo(x + w - r, y);
	if (r > 0) ctx.arc(x + w - r, y + r, r, 3 * Math.PI / 2 , 2 * Math.PI);

	if(px > x) {
		ctx.lineTo(x + w, py - vgap / 2);
		ctx.lineTo(px, py);
		ctx.lineTo(x + w, py + vgap / 2);
		ctx.closePath();
	}
	ctx.closePath();
	if (bShadow) {
		ctx.shadowColor = _rgbaToString(shadowColor);
		ctx.shadowBlur = shadowBlur;
		ctx.shadowOffsetX = shadowX;
		ctx.shadowOffsetY = shadowY;
		ctx.fill();

		ctx.globalCompositeOperation = 'destination-out';
		ctx.shadowColor = 'rgba(0, 0, 0, 0)';
		ctx.shadowBlur = 0;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.fill();

		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = gradient_BG;
		ctx.fill();

		ctx.fillStyle = gradient;
		ctx.fill();
	} else {
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = gradient_BG;
		ctx.fill();
		ctx.fillStyle = gradient;
		ctx.fill();		
	}
	ctx.globalCompositeOperation = 'source-over';
}