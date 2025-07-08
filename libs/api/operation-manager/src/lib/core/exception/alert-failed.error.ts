export class AlertFailedError extends Error {
	constructor() {
		super('Alert creation command failed');
	}
}
