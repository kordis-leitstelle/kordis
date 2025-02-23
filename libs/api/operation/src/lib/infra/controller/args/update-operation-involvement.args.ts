import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';

import { InvolvementTime } from '../../../core/entity/operation.value-objects';

@InputType()
export class UpdateOperationInvolvementsInput {
	@Field(() => [UpdateOperationUnitInvolvementInput])
	@ValidateNested({ each: true })
	@Type(() => UpdateOperationUnitInvolvementInput)
	unitInvolvements: UpdateOperationUnitInvolvementInput[];

	@Field(() => [UpdateOperationAlertGroupInvolvementInput])
	@ValidateNested({ each: true })
	@Type(() => UpdateOperationAlertGroupInvolvementInput)
	alertGroupInvolvements: UpdateOperationAlertGroupInvolvementInput[];
}

@InputType()
export class UpdateOperationUnitInvolvementInput {
	@Field()
	@IsString()
	unitId: string;

	@Field(() => [InvolvementTime])
	@ValidateNested({ each: true })
	@Type(() => InvolvementTime)
	involvementTimes: InvolvementTime[];

	@Field({ defaultValue: false })
	@IsBoolean()
	isPending: boolean;
}

@InputType()
export class UpdateOperationAlertGroupInvolvementInput {
	@Field()
	@IsString()
	alertGroupId: string;

	@Field(() => [UpdateOperationUnitInvolvementInput])
	@ValidateNested({ each: true })
	@Type(() => UpdateOperationUnitInvolvementInput)
	unitInvolvements: UpdateOperationUnitInvolvementInput[];
}
