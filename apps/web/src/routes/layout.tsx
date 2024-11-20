import PrismBackground from '~/components/PrismBackground';
import { component$, Slot } from '@builder.io/qwik';
import Footer from '~/components/Footer';
import 'virtual:uno.css';

export default component$(() => {
	return (
		<>
			<PrismBackground />
			<div style={{ minHeight: 'calc(100vh - 154px)' }}>
				<Slot />
			</div>
			<Footer />
		</>
	);
});
