import _ from 'lodash';

export default () =>
	<div className="absolute top-0 bottom-0 left-0 right-0 z--1 of-hidden" style={{ background: 'linear-gradient(0deg, #fff, #c1f7e1 40%, #7c81ff)' }}>
		<div className="absolute top-0 bottom-0 left-0 right-0" style={{ background: 'url(/img/bg_pattern.avif)', backgroundPosition: `${_.random(0, 25)}px ${_.random(0, 25)}px` }} />

		<div className="absolute top-0 left-0 right-0 h-246px bg-repeat-x" style={{ backgroundImage: 'url(/img/aurora.avif)', backgroundPositionY: '100%', opacity: _.random(0.5, 0.9, true) }} />
		<div className="absolute top-0 left-0 right-0 h-246px bg-repeat-x"
			style={{ backgroundImage: 'url(/img/aurora.avif)', backgroundPositionY: '100%', backgroundPositionX: `${_.random(1400, 1600)}px`, opacity: _.random(0.5, 0.9, true) }} />

		<div className="absolute top-0 left-0 right-0 bottom-0 bg-repeat" style={{ background: 'url(/img/bg_shines.avif)' }} />
		<div className="absolute left-5vw right-5vw bottom-0">
			<img src="/img/rainbow.avif" className="absolute bottom-100px w-60% left-20% right-20%" />
			<img src="/img/rainbow_bottom.avif" className="absolute left-0 right-0 bottom-0 w-100%" />
		</div>

		{_.times(4, (i) => <div className="absolute" style={{ left: `${_.random(20 * i, 20 * (i + 1) - 10)}vw`, top: `${_.random(0, 400)}px` }} key={i}>
			<Star />
		</div>)}

		<img src="/img/moon.avif" className="absolute top-2vh" style={{ transform: `rotate(${_.random(0, 30)}deg)`, left: `${_.random(5, 40)}vw` }} />
		<img src="/img/umbralla.avif" className="absolute" style={{ transform: `rotate(${_.random(-30, 30)}deg)`, left: `${_.random(20, 80)}vw`, top: `${_.random(-10, 150)}px` }} />
	</div>

const Star = () => <div className="grid cols-[1fr_5fr] rows-[5fr_1fr] w-60 h-60">
	<div />
	<img src="/img/tail.avif" className="h-full w-full" />
	<img src="/img/head.avif" className="h-full w-full translate-x-30% translate-y--30%" />
</div>;
