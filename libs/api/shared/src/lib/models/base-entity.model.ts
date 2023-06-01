import { validate } from 'class-validator';

import { ValidationException } from '../exceptions';
import { flattenValidationErrors } from '../exceptions/flatten-class-validation-errors';

export type UpdatableEntity<T extends BaseEntityModel> = Partial<T> & {
	id: T['id'];
};

export type WithId<T extends BaseEntityModel> = Omit<T, 'id'> & {
	id: string;
};

export abstract class BaseEntityModel {
	id?: string;

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
