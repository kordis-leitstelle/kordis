import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	IsDate,
	IsNotEmpty,
	IsString,
	Validate,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import { EndAfterStartValidation } from '../../../core/entity/end-after-start.validation';
import {
	OperationLocation,
	StartEndValidatable,
} from '../../../core/entity/operation.value-objects';

@InputType()
export class CreateOperationInvolvedAlertGroupInput {
	@IsString()
	@IsNotEmpty()
	@Field()
	alertGroupId: string;

	@IsString({ each: true })
	@ArrayNotEmpty({
		message:
			'Die beteiligten Einheiten einer Alarmgruppe dürfen nicht leer sein.',
	})
	@Field(() => [String])
	assignedUnitIds: string[];
}

@InputType()
export class CreateOperationInput implements StartEndValidatable {
	@IsDate()
	@Field()
	start: Date;

	@IsDate()
	@Validate(EndAfterStartValidation)
	@Field(() => Date)
	end: Date;

	@IsString()
	@IsNotEmpty({
		message: 'Das Alarmstichwort darf nicht leer sein.',
	})
	@Field()
	alarmKeyword: string;

	@Field()
	@ValidateNested()
	@Type(() => OperationLocation)
	location: OperationLocation;

	@IsString({ each: true })
	@ValidateIf((op) => !op.assignedAlertGroups?.length)
	@ArrayNotEmpty({
		message:
			'Es muss mindestens eine Alarmgruppe oder Einheit zugewiesen werden.',
	})
	@Field(() => [String])
	assignedUnitIds: string[];

	@ValidateNested({ each: true })
	@ValidateIf((op) => !op.assignedUnitIds?.length)
	@ArrayNotEmpty({
		message:
			'Es muss mindestens eine Alarmgruppe oder Einheit zugewiesen werden.',
	})
	@Type(() => CreateOperationInvolvedAlertGroupInput)
	@Field(() => [CreateOperationInvolvedAlertGroupInput])
	assignedAlertGroups: CreateOperationInvolvedAlertGroupInput[];
}
