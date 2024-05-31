export const computeRa = (ds: number, achievement: number): number => {
	let baseRa: number = 22.4;
	if (achievement < 50e4) {
		baseRa = 0.0;
	} else if (achievement < 60e4) {
		baseRa = 8.0;
	} else if (achievement < 70e4) {
		baseRa = 9.6;
	} else if (achievement < 75e4) {
		baseRa = 11.2;
	} else if (achievement < 80e4) {
		baseRa = 12.0;
	} else if (achievement < 90e4) {
		baseRa = 13.6;
	} else if (achievement < 94e4) {
		baseRa = 15.2;
	} else if (achievement < 97e4) {
		baseRa = 16.8;
	} else if (achievement < 98e4) {
		baseRa = 20.0;
	} else if (achievement < 99e4) {
		baseRa = 20.3;
	} else if (achievement < 995e3) {
		baseRa = 20.8;
	} else if (achievement < 1e6) {
		baseRa = 21.1;
	} else if (achievement < 1005e3) {
		baseRa = 21.6;
	}
	return Math.floor(ds * (Math.min(100.5, achievement / 1e4) / 100) * baseRa);
};
