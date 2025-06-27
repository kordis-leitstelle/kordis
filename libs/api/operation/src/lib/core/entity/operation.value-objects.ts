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

@ObjectType()
@InputType('OperationBaseAddressInput')
export class OperationBaseAddress {
	@AutoMap()
	@IsString({ always: true })
	@Field()
	street: string;

	@AutoMap()
	@IsString({ always: true })
	@Field()
	city: string;

	@AutoMap()
	@IsString({ always: true })
	@Field()
	postalCode: string;
}

@ObjectType()
@InputType('OperationLocationAddressInput')
export class OperationLocationAddress extends OperationBaseAddress {
	@AutoMap()
	@ValidateIf((o) => !o.street && !o.name, { always: true })
	@IsNotEmpty({
		message: 'Eine Straße oder Name fehlt.',
		always: true,
	})
	@AutoMap()
	@IsString({ always: true })
	@Field()
	name: string;
}

@ObjectType()
@InputType('OperationLocationInput')
export class OperationLocation {
	@AutoMap(() => Coordinate)
	@ValidateIf((o) => o.coordinate != null, { always: true })
	@ValidateNested({ always: true })
	@Type(() => Coordinate)
	@Field(() => Coordinate, { nullable: true })
	coordinate: Coordinate | null;

	@AutoMap()
	@ValidateNested({ always: true })
	@Type(() => OperationLocationAddress)
	@Field()
	address: OperationLocationAddress;
}

@ObjectType()
@InputType('OperationCategoryInput')
export class OperationCategory extends Validatable {
	@AutoMap()
	@IsString({ always: true })
	@IsNotEmpty({ always: true })
	@Field()
	name: string;

	@AutoMap()
	@IsInt({ always: true })
	@Min(0, { always: true })
	@Field()
	count: number;

	@AutoMap()
	@IsInt({ always: true })
	@Min(0, { always: true })
	@Field()
	patientCount: number;

	@AutoMap()
	@IsInt({ always: true })
	@Min(0, { always: true })
	@Field()
	dangerousSituationCount: number;

	@AutoMap()
	@IsBoolean({ always: true })
	@Field()
	wasDangerous: boolean;
}

@ObjectType()
@InputType('OperationPatientInput')
export class OperationPatient {
	@AutoMap()
	@IsString({ always: true })
	@Field()
	firstName: string;

	@AutoMap()
	@IsString({ always: true })
	@IsNotEmpty({ message: 'Ein Nachname fehlt', always: true })
	@Field()
	lastName: string;

	@AutoMap(() => Date)
	@ValidateIf((pat) => pat.birthDate != null, { always: true })
	@IsDate({ always: true })
	@Field(() => Date, { nullable: true })
	birthDate: Date | null;

	@AutoMap()
	@IsString({ always: true })
	@Field()
	phoneNumber: string;

	@AutoMap()
	@IsString({ always: true })
	@IsNotEmpty({ message: 'Der Verbleib fehlt', always: true })
	@Field()
	whereabouts: string;

	@AutoMap()
	@ValidateNested({ always: true })
	@Type(() => OperationBaseAddress)
	@Field()
	address: OperationBaseAddress;
}

export interface StartEndValidatable {
	start: Date;
	end: Date | null;
}

@ObjectType()
@InputType('OperationInvolvementTimeInput')
export class InvolvementTime implements StartEndValidatable {
	@AutoMap()
	@IsDate({ always: true })
	@Field()
	start: Date;

	@AutoMap()
	@IsDate({ always: true })
	@ValidateIf((inv) => inv.end != null, { always: true })
	@Validate(EndAfterStartValidation, { always: true })
	@Field(() => Date, { nullable: true })
	end: Date | null;
}

@ObjectType()
export class OperationUnitInvolvement extends Validatable {
	@AutoMap()
	@Field(() => UnitViewModel)
	unit: { id: string };

	@Type(() => InvolvementTime)
	@ValidateNested({ each: true, always: true })
	@Field(() => [InvolvementTime])
	involvementTimes: InvolvementTime[];

	@AutoMap()
	@IsBoolean({ always: true })
	@Field()
	isPending: boolean;
}

@ObjectType()
export class OperationAlertGroupInvolvement {
	@AutoMap()
	@Field(() => AlertGroupViewModel)
	alertGroup: { id: string };

	@AutoMap()
	@ValidateNested({ each: true, always: true })
	@Type(() => OperationUnitInvolvement)
	@Field(() => [OperationUnitInvolvement])
	unitInvolvements: OperationUnitInvolvement[];
}
