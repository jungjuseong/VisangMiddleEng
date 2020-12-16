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
	const { view, numOfReturn, state, actions } = props;

	const _getAudio = (idx: number) => {
		const word = actions.getWords()[idx];
		if(word) return word.audio;
		else return '';
	};

	const _gotoResult = async () => {
		actions.prepareGroupResult();
		actions.setQuizProg('wait-result');
		state.prog = 'quiz';
		await kutil.wait(100);
		actions.setQuizProg('result');
	};

	return (
		<TeamSpindle
			view={view}
			numOfReturn={numOfReturn}
			numOfGa={state.gas.length}
			numOfNa={state.nas.length}
			hasAudio={state.qtype !== 'usage'}
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

export default Board;