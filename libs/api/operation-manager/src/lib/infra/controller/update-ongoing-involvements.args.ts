import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsMongoId, ValidateNested } from 'class-validator';

@ObjectType()
@InputType()
export class AssignedAlertGroup {
	@Field()
	@IsMongoId()
	alertGroupId: string;

	@Field(() => [String])
	@IsMongoId({ each: true })
	assignedUnitIds: string[];
}

@InputType()
export class UpdateOngoingAssignmentsInput {
	@Field(() => [String])
	@IsMongoId({ each: true })
	assignedUnitIds: string[];

	@Field(() => [AssignedAlertGroup])
	@Type(() => AssignedAlertGroup)
	@ValidateNested({ each: true })
	assignedAlertGroups: AssignedAlertGroup[];
}

@ArgsType()
export class UpdateOngoingOperationInvolvementsArgs {
	@Field(() => ID)
	@IsMongoId()
	operationId: string;

	@Field(() => UpdateOngoingAssignmentsInput)
	@Type(() => UpdateOngoingAssignmentsInput)
	@ValidateNested()
	involvements: UpdateOngoingAssignmentsInput;
}
