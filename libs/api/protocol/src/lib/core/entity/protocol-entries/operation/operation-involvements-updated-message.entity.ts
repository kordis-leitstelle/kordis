import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsMongoId,
	IsNotEmpty,
	IsString,
	ValidateNested,
} from 'class-validator';

import { ProtocolEntryBase } from '../protocol-entry.entity';
import {
	OperationMessageAssignedAlertGroup,
	OperationMessageAssignedUnit,
} from './operation-message.value-objects';

@ObjectType()
export class OperationAssignmentsUpdatedMessagePayload {
	@Field()
	@AutoMap()
	@IsMongoId()
	@IsNotEmpty()
	operationId: string;

	@Field()
	@AutoMap()
	@IsString()
	@IsNotEmpty()
	operationSign: string;

	@Field(() => [OperationMessageAssignedUnit])
	@AutoMap(() => [OperationMessageAssignedUnit])
	@Type(() => OperationMessageAssignedUnit)
	@ValidateNested({ each: true })
	assignedUnits: OperationMessageAssignedUnit[];

	@Field(() => [OperationMessageAssignedAlertGroup])
	@AutoMap(() => [OperationMessageAssignedAlertGroup])
	@Type(() => OperationMessageAssignedAlertGroup)
	@ValidateNested({ each: true })
	assignedAlertGroups: OperationMessageAssignedAlertGroup[];
}

@ObjectType()
export class OperationAssignmentsUpdatedMessage extends ProtocolEntryBase {
	@Field(() => OperationAssignmentsUpdatedMessagePayload)
	@AutoMap()
	declare payload: OperationAssignmentsUpdatedMessagePayload;
}
