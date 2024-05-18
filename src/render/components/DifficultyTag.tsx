import React from 'react';
import { LEVEL_COLOR, LEVEL_EN } from '../../consts';

export default ({ level }: { level: number }) =>
	<div style={{ borderRadius: '9999px', padding: '0 .5em', backgroundColor: LEVEL_COLOR[level], lineHeight: 1.7, width: 'max-content', color: 'white' }}>
		{LEVEL_EN[level].toUpperCase()}
	</div>
