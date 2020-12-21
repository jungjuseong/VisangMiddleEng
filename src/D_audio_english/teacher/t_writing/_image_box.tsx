import * as React from 'react';

interface ImageBoxProps {
	role: 'A'|'B'|'';
	images: string[];
	onRoleA: () => void;
	onRoleB: () => void;
}

function ImageBox(props: ImageBoxProps) {
	const { role, images, onRoleA, onRoleB } = props;

	return (
	<div className="img_box">
		<div className={'A' + (role === 'A' ? ' on' : '')}>
			<span className="icon_check A" />
			<img src={images[0]} onClick={onRoleA}/>
		</div>
		<div className={'B' + (role === 'B' ? ' on' : '')}>
			<span className="icon_check B" />
			<img src={images[1]} onClick={onRoleB}/>
		</div>
	</div>);
}

export default ImageBox;