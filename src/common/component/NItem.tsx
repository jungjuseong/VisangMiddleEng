import * as React from 'react';

interface INItemProps {
	className?: string;
	idx: number;
	on: boolean;
	onClick: (idx: number) => void;
}

class NItem extends React.Component<INItemProps> {
	private _click = () => {
		this.props.onClick(this.props.idx);
	}
	public render() {
		const { idx, on, className } = this.props;
		return <span className={(className ? className : '') + (on ? ' on' : '')} onClick={this._click}>{idx + 1}</span>;
	}
}

export default NItem;