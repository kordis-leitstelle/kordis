import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { validate } from 'class-validator';

import { ValidationException } from '../exceptions';
import { flattenValidationErrors } from '../exceptions/flatten-class-validation-errors';

export interface BaseModel {
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

@ObjectType()
export abstract class BaseEntityModel implements BaseModel {
	@Field()
	readonly id: string;
	@Field(() => String)
	@AutoMap()
	readonly createdAt: Date = new Date();
	@Field(() => String)
	@AutoMap()
	readonly updatedAt: Date;

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
