export class DiveraRequestFailedError extends Error {
	constructor(originalError: unknown) {
		super(`Creating Divera Alarm via HTTP Request failed`, {
			cause: originalError,
		});
	}
}
