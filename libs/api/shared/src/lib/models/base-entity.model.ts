import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

import { Validatable } from './validatable.model';

export interface BaseModel {
	orgId: string;
	createdAt: Date;
	updatedAt: Date;
}

@ObjectType({ isAbstract: true })
export class BaseEntityModel extends Validatable implements BaseModel {
	@Field(() => ID)
	readonly id: string;
	@IsString()
	@IsNotEmpty()
	@Field()
	orgId: string;
	@Field()
	readonly createdAt: Date = new Date();
	@Field()
	readonly updatedAt: Date;
}
