import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsString,
	MaxLength,
	ValidateIf,
} from 'class-validator';

import { Validatable } from '@kordis/api/shared';

export enum UnitInputType {
	REGISTERED_UNIT = 'REGISTERED_UNIT',
	UNKNOWN_UNIT = 'UNKNOWN_UNIT',
}

registerEnumType(UnitInputType, {
	name: 'UnitInputType',
});

@InputType()
export class UnitInput extends Validatable {
	@Field()
	@IsEnum(UnitInputType)
	type: UnitInputType;

	@Field({ nullable: true })
	@ValidateIf((u) => u.type === UnitInputType.REGISTERED_UNIT)
	@IsMongoId()
	@IsNotEmpty()
	id?: string;

	@Field({ nullable: true })
	@ValidateIf((u) => u.type === UnitInputType.UNKNOWN_UNIT)
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	name?: string;
}
