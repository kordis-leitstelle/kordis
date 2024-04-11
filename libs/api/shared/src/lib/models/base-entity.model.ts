import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Validatable } from './validatable.model';

export interface BaseModel {
	createdAt: Date;
	updatedAt: Date;
}

@ObjectType({ isAbstract: true })
export class BaseEntityModel extends Validatable implements BaseModel {
	@Field(() => ID)
	readonly id: string;
	@Field()
	readonly createdAt: Date = new Date();
	@Field()
	readonly updatedAt: Date;
}
