import { validate } from 'class-validator';

import { ValidationException } from '../exceptions/core/validation.exception';
import { flattenValidationErrors } from '../exceptions/flatten-class-validation-errors';

export abstract class Validatable {
	async validOrThrow(): Promise<void> {
		const errors = await validate(this);

		if (errors.length > 0) {
			const validationErrors = flattenValidationErrors(errors);

			throw new ValidationException(
				validationErrors,
				`${this.constructor.name} validation failed.`,
			);
		}
	}
}
