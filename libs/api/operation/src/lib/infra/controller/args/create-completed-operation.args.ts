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
	@ValidateIf((op) => !!op.end)
	@Validate(EndAfterStartValidation)
	@Field(() => Date, { nullable: true })
	end: Date | null;

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
	@ValidateIf((op) => !op.involvedAlertGroups?.length)
	@ArrayNotEmpty({
		message: 'Die beteiligten Einheiten dürfen nicht leer sein.',
	})
	@Field(() => [String])
	assignedUnitIds: string[];

	@ValidateNested({ each: true })
	@Type(() => CreateOperationInvolvedAlertGroupInput)
	@Field(() => [CreateOperationInvolvedAlertGroupInput])
	assignedAlertGroups: CreateOperationInvolvedAlertGroupInput[];
}
