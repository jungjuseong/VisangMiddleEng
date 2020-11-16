import * as React from 'react';

import { observer } from 'mobx-react';
import { IStateCtx, IActionsCtx } from './t_store';
import TeamSpindle from '../../share/TeamSpindle';
import * as kutil from '@common/util/kutil';

interface IBoardProps {
	view: boolean;
	numOfReturn: number; 
	state: IStateCtx;
	actions: IActionsCtx;
}

function Board(props: React.PropsWithChildren<IBoardProps>) {

	const _getAudio = (idx: number) => {
		const word = props.actions.getWords()[idx];
		if(word) return word.audio;
		else return '';
	}

	const _gotoResult = async () => {
		props.actions.prepareGroupResult();
		props.actions.setQuizProg('wait-result');
		props.state.prog = 'quiz';
		await kutil.wait(100);
		props.actions.setQuizProg('result');
	}

	const { view, numOfReturn, state, actions } = props;

	return (
		<TeamSpindle
			view={view}
			numOfReturn={numOfReturn}
			numOfGa={state.gas.length}
			numOfNa={state.nas.length}
			hasAudio={state.quizType !== 'usage'}
			getAudio={_getAudio}
			gotoResult={_gotoResult}

			getGroupInfo={actions.getGroupInfo}
			setQIdx={actions.setQIdx}
			gotoQuizSelect={actions.gotoQuizSelect}

			setNaviView={actions.setNaviView}
			setNaviFnc={actions.setNaviFnc}
			setNavi={actions.setNavi}
		/>
	);
	
}

@observer
class BoardClass extends React.Component<IBoardProps> {

	private _getAudio = (idx: number) => {
		const word = this.props.actions.getWords()[idx];
		if(word) return word.audio;
		else return '';
	}

	private _gotoResult = async () => {
		this.props.actions.prepareGroupResult();
		this.props.actions.setQuizProg('wait-result');
		this.props.state.prog = 'quiz';
		await kutil.wait(100);
		this.props.actions.setQuizProg('result');
	}

	public render() {
		const { view, numOfReturn, state, actions } = this.props;

		return (
			<TeamSpindle
				view={view}
				numOfReturn={numOfReturn}
				numOfGa={state.gas.length}
				numOfNa={state.nas.length}
				hasAudio={state.quizType !== 'usage'}
				getAudio={this._getAudio}
				gotoResult={this._gotoResult}

				getGroupInfo={actions.getGroupInfo}
				setQIdx={actions.setQIdx}
				gotoQuizSelect={actions.gotoQuizSelect}

				setNaviView={actions.setNaviView}
				setNaviFnc={actions.setNaviFnc}
				setNavi={actions.setNavi}
			/>
		);
	}
}

export default Board;