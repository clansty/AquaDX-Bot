import { component$ } from '@builder.io/qwik';

export default component$(({ color, progress }: { color: string, progress: number }) =>
	<div style={{ height: 7, width: '100%', backgroundColor: '#cbd5e1' }}>
		<div style={{ height: '100%', width: progress * 100 + '%', backgroundColor: color }} />
	</div>);
