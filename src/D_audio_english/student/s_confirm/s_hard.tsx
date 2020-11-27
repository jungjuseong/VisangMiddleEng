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
	}

	private _onChoice = (choice: number) => {
		this.props.onChoice(this.props.idx, choice);
	}
	state = {
		activeDrags: 0,
		deltaPosition: {
			x: 0, y: 0
		},
		controlledPosition: {
			x: -400, y: 200
		}
	};

	onStart = () => {
		this.setState({ activeDrags: ++this.state.activeDrags });
	};

	onStop = () => {
		this.setState({ activeDrags: --this.state.activeDrags });
	};

	public render() {
		// const {view, idx, choice, confirm_normal, confirmProg} = this.props;
		const { view } = this.props;
		const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
		return (
			<>
				<div className="quiz_box" style={{ display: view ? '' : 'none' }}>
					<div className="sup_question">
						<div className="quiz">
							<WrapTextNew view={view}>
								{this._jsx_sentence}
							</WrapTextNew>
						</div>
						<div>
							<div className="white_box">
								<p>1.{this._jsx_question1.question}</p>
								<p>{_getBlockJSX(this._jsx_question1.hint)}</p>
							</div>
						</div>
						<div>
							<div className="white_box">
								<p>1.{this._jsx_question2.question}</p>
								<p>{_getBlockJSX(this._jsx_question2.hint)}</p>
							</div>
						</div>
						<div>
							<div className="white_box">
								<p>1.{this._jsx_question3.question}</p>
								<p>{_getBlockJSX(this._jsx_question3.hint)}</p>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}
}

export default QuizItem;