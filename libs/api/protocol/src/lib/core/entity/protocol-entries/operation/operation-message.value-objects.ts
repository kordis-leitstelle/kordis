import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsMongoId, IsString, ValidateNested } from 'class-validator';

@ObjectType()
export class OperationMessageAssignedUnit {
	@Field()
	@AutoMap()
	@IsMongoId()
	unitId: string;

	@Field()
	@AutoMap()
	@IsString()
	unitSign: string;

	@Field()
	@AutoMap()
	@IsString()
	unitName: string;
}

@ObjectType()
export class OperationMessageAssignedAlertGroup {
	@Field()
	@AutoMap()
	@IsMongoId()
	alertGroupId: string;

	@Field()
	@AutoMap()
	@IsString()
	alertGroupName: string;

	@Field(() => [OperationMessageAssignedUnit])
	@AutoMap(() => [OperationMessageAssignedUnit])
	@Type(() => OperationMessageAssignedUnit)
	@ValidateNested({ each: true })
	assignedUnits: OperationMessageAssignedUnit[];
}
