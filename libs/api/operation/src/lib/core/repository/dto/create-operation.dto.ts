import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsDate,
	IsEnum,
	IsNotEmpty,
	IsString,
	Validate,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import { Validatable } from '@kordis/api/shared';

import { EndAfterStartValidation } from '../../entity/end-after-start.validation';
import { OperationProcessState } from '../../entity/operation-process-state.enum';
import {
	OperationLocation,
	StartEndValidatable,
} from '../../entity/operation.value-objects';

export class CreateOperationDtoInvolvedUnit {
	@IsString()
	@IsNotEmpty()
	unitId: string;

	@IsDate()
	start: Date;

	@IsBoolean()
	isPending: boolean;
}

export class CreateOperationDtoInvolvedAlertGroup {
	@IsString()
	@IsNotEmpty()
	alertGroupId: string;

	@ValidateNested({ each: true })
	@Type(() => CreateOperationDtoInvolvedUnit)
	involvedUnits: CreateOperationDtoInvolvedUnit[];
}

export class CreateOperationDto
	extends Validatable
	implements StartEndValidatable
{
	@IsString()
	@IsNotEmpty()
	sign: string;

	@IsEnum(OperationProcessState)
	processState: OperationProcessState;

	@IsString()
	@IsNotEmpty()
	createdByUserId: string;

	@IsDate()
	start: Date;

	@IsDate()
	@ValidateIf((op) => !!op.end)
	@Validate(EndAfterStartValidation)
	end: Date | null;

	@ValidateNested()
	location: OperationLocation;

	@IsString()
	@IsNotEmpty()
	alarmKeyword: string;
}
