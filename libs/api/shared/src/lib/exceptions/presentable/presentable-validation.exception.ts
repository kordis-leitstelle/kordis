import { ValidationError } from 'class-validator';
import { GraphQLFormattedError } from 'graphql/error';

import {
	ValidationException,
	ValidationExceptionEntry,
} from '../core/validation.exception';
import { flattenValidationErrors } from '../flatten-class-validation-errors';
import { PresentableException } from './presentable.exception';

export class PresentableValidationException extends PresentableException {
	readonly code = 'VALIDATION_EXCEPTION';

	constructor(
		message: string,
		private readonly errors: ValidationExceptionEntry[],
	) {
		super(message);
	}

	static fromCoreValidationException(
		message: string,
		e: ValidationException,
	): PresentableValidationException {
		return new PresentableValidationException(message, e.errors);
	}

	static fromClassValidationErrors(
		errors: ValidationError[],
	): PresentableValidationException {
		console.log(errors);
		const validationExceptionEntries: ValidationExceptionEntry[] =
			flattenValidationErrors(errors);

		return new PresentableValidationException(
			'Validierungsfehler',
			validationExceptionEntries,
		);
	}

	override asGraphQLError(): GraphQLFormattedError {
		const formattedError = super.asGraphQLError();
		if (!formattedError.extensions) formattedError.extensions = {};
		formattedError.extensions.errors = this.errors;

		return formattedError;
	}
}
