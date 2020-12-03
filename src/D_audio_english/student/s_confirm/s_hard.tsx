import * as React from 'react';
import Draggable from 'react-draggable';

import { QPROG } from '../s_store';
import * as common from '../../common';
import WrapTextNew from '@common/component/WrapTextNew';
import { observer, PropTypes } from 'mobx-react';
import { observable } from 'mobx';

import { _getJSX, _getBlockJSX} from '../../../get_jsx';
import { App } from '../../../App';
import { NONE } from 'src/share/style';

const SwiperComponent = require('react-id-swiper').default;

interface IQuizItem {
	view: boolean;
	idx: number;
	choice: number;
	data: common.IConfirmHard;
	confirmProg: QPROG;
	onChoice: (idx: number, choice: number) => void;
}
@observer
class QuizItem extends React.Component<IQuizItem> {
	@observable private _toggle: Array<boolean | null> = [null, null, null];
	@observable private _curIdx = 0;
	@observable private _curIdx_tgt = 0;
	@observable private _answer;
	private _swiper: Swiper|null = null;

	private _jsx_sentence: JSX.Element;
	private _jsx_eng_sentence: JSX.Element;
	private _jsx_question1: common.IProblemHard;
	private _jsx_question2: common.IProblemHard;
	private _jsx_question3: common.IProblemHard;

	public constructor(props: IQuizItem) {
		super(props);
		this._jsx_sentence = _getJSX(props.data.directive.kor); // 문제
		this._jsx_eng_sentence = _getJSX(props.data.directive.eng); // 문제
		this._jsx_question1 = props.data.problem1;
		this._jsx_question2 = props.data.problem2;
		this._jsx_question3 = props.data.problem3;

		this._answer = true;
	}

	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;

		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			this._curIdx = -1;
		});
		swiper.on('transitionEnd', () => {
			if(this.props.view) {
				this._curIdx = swiper.activeIndex;
				this._curIdx_tgt = this._curIdx;
			}
		});
		this._swiper = swiper;
	}

	private _onChoice = (choice: number) => {
		this.props.onChoice(this.props.idx, choice);
	}

	public render() {
		// const {view, idx, choice, confirm_normal, confirmProg} = this.props;
		const { view } = this.props;
		const quizs = [this._jsx_question1, this._jsx_question2, this._jsx_question3]
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className="hard_question">
						<SwiperComponent>
							{quizs.map((quiz, idx) => {
								return (
									<div key={idx} className= "q-item">
										<div className="quiz">
											<WrapTextNew view={view}>
												{this._jsx_sentence}
											</WrapTextNew>
										</div>
										<div className="sentence_box">
											<canvas></canvas>
											<div className="question_box">
												<p>{idx + 1}.{quizs[idx].question}</p>
												<p>{_getBlockJSX(quiz.hint)}</p>
											</div>
										</div>
										<div className="speechbubble_box" >
											<div className={(this._answer ? ' view-answer' : '')}>
												<div className={'sample' + (this._answer ? ' hide' : '')}/>
												<div className={'answer' + (this._answer ? '' : ' hide')}>
													{_getBlockJSX(quiz.answer)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</SwiperComponent>
					</div>
				</div>
			</>
		);
	}
}

export default QuizItem;