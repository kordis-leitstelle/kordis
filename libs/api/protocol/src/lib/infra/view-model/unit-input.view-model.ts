import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsString,
	MaxLength,
	Validate,
	ValidateIf,
} from 'class-validator';

import { Validatable } from '@kordis/api/shared';

import { IsValidUnitInputType } from '../validators/is-valid-unit-input-type.constraint';

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
	@Validate(IsValidUnitInputType, {
		message:
			'Es dürfen nur die id bei bekannten Einheiten oder der Name bei unbekannten Einheiten gesetzt sein.',
	})
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
	@MaxLength(20, {
		message:
			'Der Name einer unbekannten Einheit darf maximal 20 Zeichen lang sein.',
	})
	name?: string;
}
