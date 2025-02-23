import { validate } from 'class-validator';

import { ValidationException } from '../exceptions/core/validation.exception';
import { flattenValidationErrors } from '../exceptions/flatten-class-validation-errors';

export abstract class Validatable {
	async validOrThrow(groups?: string[]): Promise<void> {
		const errors = await validate(this, { groups });

		if (errors.length > 0) {
			throw new ValidationException(
				flattenValidationErrors(errors),
				`${this.constructor.name} validation failed.`,
			);
		}
	}
}
