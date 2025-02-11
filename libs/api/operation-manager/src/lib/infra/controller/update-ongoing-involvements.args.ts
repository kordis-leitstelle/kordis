import { Field, InputType, ObjectType } from '@nestjs/graphql';
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
