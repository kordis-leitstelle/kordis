import { AutoMap } from '@automapper/classes';
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
	@AutoMap()
	readonly id: string;
	@IsString()
	@IsNotEmpty()
	@Field()
	@AutoMap()
	orgId: string;
	@Field()
	@AutoMap()
	readonly createdAt: Date = new Date();
	@Field({ nullable: true })
	@AutoMap()
	readonly updatedAt: Date;
}
