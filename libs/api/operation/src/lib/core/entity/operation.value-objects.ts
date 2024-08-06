import { AutoMap } from '@automapper/classes';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsDate,
	IsInt,
	IsNotEmpty,
	IsString,
	Min,
	Validate,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import { Coordinate, Validatable } from '@kordis/api/shared';
import { AlertGroupViewModel, UnitViewModel } from '@kordis/api/unit';

import { EndAfterStartValidation } from './end-after-start.validation';

export interface StartEndValidatable {
	start: Date;
	end: Date | null;
}

@ObjectType()
@InputType('OperationBaseAddressInput')
export class OperationBaseAddress {
	@AutoMap()
	@IsString()
	@Field()
	street: string;

	@AutoMap()
	@IsString()
	@Field()
	city: string;

	@AutoMap()
	@IsString()
	@Field()
	postalCode: string;
}

@ObjectType()
@InputType('OperationLocationAddressInput')
export class OperationLocationAddress extends OperationBaseAddress {
	@AutoMap()
	@ValidateIf((o) => !o.street && !o.name)
	@IsNotEmpty({
		message: 'Eine Straße oder Name fehlt.',
	})
	@IsString()
	@Field()
	name: string;
}

@ObjectType()
@InputType('OperationLocationInput')
export class OperationLocation {
	@AutoMap(() => Coordinate)
	@ValidateNested()
	@ValidateIf((o) => o.coordinate != null)
	@Type(() => Coordinate)
	@Field(() => Coordinate, { nullable: true })
	coordinate: Coordinate | null;

	@AutoMap()
	@ValidateNested()
	@Type(() => OperationLocationAddress)
	@Field()
	address: OperationLocationAddress;
}

@ObjectType()
@InputType('OperationCategoryInput')
export class OperationCategory extends Validatable {
	@AutoMap()
	@IsString()
	@IsNotEmpty()
	@Field()
	name: string;

	@AutoMap()
	@IsInt()
	@Min(0)
	@Field()
	count: number;

	@AutoMap()
	@IsInt()
	@Min(0)
	@Field()
	patientCount: number;

	@AutoMap()
	@IsInt()
	@Min(0)
	@Field()
	dangerousSituationCount: number;

	@AutoMap()
	@IsBoolean()
	@Field()
	wasDangerous: boolean;
}

@ObjectType()
@InputType('OperationPatientInput')
export class OperationPatient {
	@AutoMap()
	@IsString()
	@Field()
	firstName: string;

	@AutoMap()
	@IsString()
	@IsNotEmpty({ message: 'Ein Nachname fehlt.', always: true })
	@Field()
	lastName: string;

	@AutoMap()
	@ValidateIf((pat) => pat.birthDate != null)
	@IsDate()
	@Field(() => Date, { nullable: true })
	birthDate: Date | null;

	@AutoMap()
	@IsString()
	@Field()
	phoneNumber: string;

	@AutoMap()
	@IsString()
	@IsNotEmpty({ message: 'Der Verbleib fehlt.', always: true })
	@Field()
	whereabouts: string;

	@AutoMap()
	@ValidateNested()
	@Type(() => OperationBaseAddress)
	@Field()
	address: OperationBaseAddress;
}

@ObjectType()
@InputType('OperationInvolvementTimeInput')
export class InvolvementTime implements StartEndValidatable {
	@AutoMap()
	@IsDate()
	@Field()
	start: Date;

	@AutoMap()
	@IsDate()
	@ValidateIf((inv) => inv.end != null)
	@Validate(EndAfterStartValidation)
	@Field(() => Date, { nullable: true })
	end: Date | null;
}

@ObjectType()
export class OperationUnitInvolvement extends Validatable {
	@AutoMap()
	@Field(() => UnitViewModel)
	unit: { id: string };

	@Type(() => InvolvementTime)
	@ValidateNested({ each: true })
	@Field(() => [InvolvementTime])
	involvementTimes: InvolvementTime[];

	@AutoMap()
	@IsBoolean()
	@Field()
	isPending: boolean;
}

@ObjectType()
export class OperationAlertGroupInvolvement {
	@AutoMap()
	@Field(() => AlertGroupViewModel)
	alertGroup: { id: string };

	@AutoMap()
	@ValidateNested({ each: true })
	@Type(() => OperationUnitInvolvement)
	@Field(() => [OperationUnitInvolvement])
	unitInvolvements: OperationUnitInvolvement[];
}
