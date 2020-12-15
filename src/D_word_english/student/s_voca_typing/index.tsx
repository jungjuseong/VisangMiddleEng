import * as React from 'react';
import { Observer } from 'mobx-react';

import { StudentContext, useStudent } from '../s_store';
import VocaTypingQuiz from './_voca_typing_quiz';

const VocaTyping = useStudent((store: StudentContext) => (
	<Observer>
		{() => {
			const { state, actions } = store;
			const view = (state.viewDiv === 'content' && state.prog === 'spelling');

			return (
				<VocaTypingQuiz view={view}	entry={(view) ? actions.getWord().entry : ''}	actions={actions} state={state}/>
			);
		}}
	</Observer>
));

export default VocaTyping;