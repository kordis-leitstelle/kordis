import { validate } from 'class-validator';

import { ValidationException } from '../exceptions';
import { flattenValidationErrors } from '../exceptions/flatten-class-validation-errors';

export type UpdatableEntity<T extends BaseEntityModel> = Partial<T> & {
	id: T['id'];
};

export abstract class BaseEntityModel {
	id: string | undefined;

	async validOrThrow(): Promise<void | never> {
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
