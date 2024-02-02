export class SdsNotAbleToSendException extends Error {
	constructor(error: unknown) {
		super(`Not able to send SDS: ${error}`);
	}
}
