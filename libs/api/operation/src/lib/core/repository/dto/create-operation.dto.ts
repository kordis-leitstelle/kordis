import {
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
