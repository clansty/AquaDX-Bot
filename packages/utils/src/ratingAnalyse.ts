export const ratingAnalyse = (rating: number): string => {
	const sssp = rating / 22.4 / 1.005;
	const sss = rating / 21.6;
	const ss = rating / 20.8 / 0.99;

	return `${rating} ≈ ${sssp.toFixed(1)} SSS+ / ${sss.toFixed(1)} SSS / ${ss.toFixed(1)} SS`;
};
