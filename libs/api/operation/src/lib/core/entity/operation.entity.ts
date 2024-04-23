import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

import { BaseEntityModel } from '@kordis/api/shared';

@ObjectType()
export class Operation extends BaseEntityModel {
	@AutoMap()
	@IsString()
	@IsNotEmpty()
	@Field()
	sign: string;

	@AutoMap()
	@IsDate()
	@Field()
	start: Date;

	@AutoMap()
	@IsDate()
	@ValidateIf((op) => !!op.end)
	@Field({ nullable: true })
	// TODO: end > start
	end?: Date;
}
