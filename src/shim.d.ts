declare type MYSVGElement = SVGSVGElement & {
	animationsPaused: () => boolean,
};
declare type MYAniTransEL = SVGElement & {
	beginElement: () => void,
	beginElementAt: (sec: number) => void,
	endElement: () => void,
	endElementAt: (sec: number) => void,
};

declare const cfg_debug: boolean;
declare const cfg_dist: boolean;

/* TEMPLATE */
declare const p_base_template_t: boolean;
declare const p_base_template_s: boolean;

declare const _digenglishCB_lib_:string;
declare const _project_:string;

declare const d_word_english_t: boolean;
declare const d_word_english_s: boolean;
declare const d_video_english_t: boolean;
declare const d_video_english_s: boolean;
declare const d_reading_english_t: boolean;
declare const d_reading_english_s: boolean;
declare const d_audio_english_t: boolean;
declare const d_audio_english_s: boolean;
declare const _build_timestamp_:string;
