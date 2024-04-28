import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsDate,
	IsIn,
	IsInt,
	IsNotEmpty,
	IsString,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import { BaseEntityModel, Validatable } from '@kordis/api/shared';

import {
	ALLOWED_PERSISTENT_UNIT_STATUS,
	PersistentUnitStatus,
} from './status.type';

@ObjectType()
export class FurtherAttribute {
	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	name: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	value: string;
}

@ObjectType()
export class UnitStatus extends Validatable {
	@Field(() => Number)
	@IsInt()
	@IsIn(ALLOWED_PERSISTENT_UNIT_STATUS)
	@AutoMap(() => Number)
	status: PersistentUnitStatus;

	@Field(() => String)
	@IsDate()
	@AutoMap()
	receivedAt: Date;

	@Field()
	@IsString()
	@AutoMap()
	source: string;
}

@ObjectType('Unit')
export class UnitEntity extends BaseEntityModel {
	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	name: string;

	@Field(() => UnitStatus, { nullable: true })
	@ValidateNested()
	@Type(() => UnitStatus)
	@ValidateIf((unit) => unit.status !== null)
	@AutoMap(() => UnitStatus)
	status: UnitStatus | null;

	@Field()
	@IsString()
	@AutoMap()
	note: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	department: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	rcsId: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	callSign: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	callSignAbbreviation: string;

	@Field(() => [FurtherAttribute])
	@ValidateNested({ each: true })
	@Type(() => FurtherAttribute)
	@AutoMap()
	furtherAttributes: FurtherAttribute[];
}
