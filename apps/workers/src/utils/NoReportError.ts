export default class NoReportError extends Error {
		constructor(message) {
				super(message);
				this.name = 'NoReportError';
		}
}
