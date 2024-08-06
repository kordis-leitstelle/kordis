import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	IsDate,
	IsEnum,
	IsNotEmpty,
	IsString,
	Validate,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import { BaseEntityModel } from '@kordis/api/shared';

import { DateInPastValidation } from './date-in-past.validation';
import { EndAfterStartValidation } from './end-after-start.validation';
import { OperationProcessState } from './operation-process-state.enum';
import {
	OperationAlertGroupInvolvement,
	OperationCategory,
	OperationLocation,
	OperationPatient,
	OperationUnitInvolvement,
	StartEndValidatable,
} from './operation.value-objects';

@ObjectType('Operation')
export class OperationEntity
	extends BaseEntityModel
	implements StartEndValidatable
{
	@AutoMap()
	@IsEnum(OperationProcessState, { always: true })
	@Field(() => OperationProcessState)
	processState: OperationProcessState;

	createdByUser: { id: string };

	@AutoMap()
	@IsString({ always: true })
	@IsNotEmpty({ always: true })
	@Field()
	sign: string;

	@AutoMap()
	@IsDate({ always: true })
	@Field()
	@Validate(DateInPastValidation, {
		message: 'Der Einsatzbeginn muss in der Vergangenheit liegen.',
		always: true,
	})
	start: Date;

	@AutoMap()
	@ValidateIf(
		(op) =>
			op.end !== null ||
			[
				OperationProcessState.ARCHIVED,
				OperationProcessState.COMPLETED,
			].includes(op.processState),
	)
	@IsDate({ always: true })
	@Field(() => Date, { nullable: true })
	@Validate(EndAfterStartValidation)
	end: Date | null;

	@AutoMap()
	@ValidateIf((op) => op.processState === OperationProcessState.ARCHIVED)
	@IsString({ always: true })
	@IsNotEmpty({ groups: ['archived'] })
	@Field()
	commander: string;

	@AutoMap()
	@IsString({ always: true })
	@IsNotEmpty({ groups: ['archived'], message: 'Die Alarmierungsart fehlt.' })
	@Field()
	reporter: string;

	@AutoMap()
	@IsString({ always: true })
	@IsNotEmpty({ groups: ['archived'], message: 'Das Alarmstichwort fehlt.' })
	@Field()
	alarmKeyword: string;

	@AutoMap()
	@IsString({ always: true })
	@IsNotEmpty({ groups: ['archived'], message: 'Die Beschreibung fehlt.' })
	@Field()
	description: string;

	@AutoMap()
	@IsString({ always: true })
	@Field()
	externalReference: string;

	@AutoMap(() => [OperationCategory])
	@ArrayNotEmpty({
		groups: ['archived'],
		message: 'Es muss mindestens eine Einsatzart angegeben werden.',
	})
	@ValidateNested({ each: true })
	@Type(() => OperationCategory)
	@Field(() => [OperationCategory])
	categories: OperationCategory[];

	@AutoMap(() => OperationLocation)
	@ValidateNested({ always: true })
	@Type(() => OperationLocation)
	@Field()
	location: OperationLocation;

	@AutoMap(() => [OperationPatient])
	@ValidateNested({ each: true })
	@Type(() => OperationPatient)
	@Field(() => [OperationPatient])
	patients: OperationPatient[];

	@ValidateNested({ each: true })
	@Type(() => OperationUnitInvolvement)
	@Field(() => [OperationUnitInvolvement])
	unitInvolvements: OperationUnitInvolvement[];

	@ValidateNested({ each: true })
	@Type(() => OperationAlertGroupInvolvement)
	@Field(() => [OperationAlertGroupInvolvement])
	alertGroupInvolvements: OperationAlertGroupInvolvement[];
}
