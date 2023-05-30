export interface ValidationExceptionEntry {
	path: string[];
	errors: string[];
}

export class ValidationException extends Error {
	constructor(
		readonly errors: ValidationExceptionEntry[],
		message = 'Validation Exception',
	) {
		super(message);
	}
}
