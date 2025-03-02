import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsDate,
	IsString,
	Validate,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import { DateInPastValidation } from '../../../core/entity/date-in-past.validation';
import { EndAfterStartValidation } from '../../../core/entity/end-after-start.validation';
import {
	OperationCategory,
	OperationLocation,
	OperationPatient,
} from '../../../core/entity/operation.value-objects';

// This is the input type of the argument for the partial base data update mutation
@InputType()
export class UpdateOperationBaseDataInput {
	@ValidateIf((op) => op.end !== undefined)
	@IsDate()
	@Field(() => Date, { nullable: true })
	@Validate(DateInPastValidation, {
		message: 'Der Einsatzbeginn darf nicht in der Zukunft liegen.',
	})
	start?: Date;

	// todo: an end should only be allowed to set if the operation has ended, if the operation has ended, it can not be started again
	@ValidateIf((op) => op.end != null)
	@IsDate()
	@Field(() => Date, { nullable: true })
	@Validate(EndAfterStartValidation)
	end?: Date | null;

	@ValidateIf((op) => op.commander !== undefined)
	@IsString()
	@Field(() => String, { nullable: true })
	commander?: string;

	@ValidateIf((op) => op.description != undefined)
	@IsString()
	@Field(() => String, { nullable: true })
	description?: string;

	@ValidateIf((op) => op.reporter !== undefined)
	@IsString()
	@Field(() => String, { nullable: true })
	reporter?: string;

	@ValidateIf((op) => op.alarmKeyword != undefined)
	@IsString()
	@Field(() => String, { nullable: true })
	alarmKeyword?: string;

	@ValidateIf((op) => op.externalReference != undefined)
	@IsString()
	@Field(() => String, { nullable: true })
	externalReference?: string;

	@ValidateIf((op) => op.location != null)
	@ValidateNested()
	@Type(() => OperationLocation)
	@Field(() => OperationLocation, { nullable: true })
	location?: OperationLocation;

	@ValidateIf((op) => op.categories != undefined)
	@ValidateNested({ each: true })
	@Type(() => OperationCategory)
	@Field(() => [OperationCategory], { nullable: true })
	categories?: OperationCategory[];

	@ValidateIf((op) => op.patients != undefined)
	@ValidateNested({ each: true })
	@Type(() => OperationPatient)
	@Field(() => [OperationPatient], { nullable: true })
	patients?: OperationPatient[];
}
