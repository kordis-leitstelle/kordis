import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsMongoId,
	IsNotEmpty,
	IsString,
	ValidateNested,
} from 'class-validator';

import { ProtocolMessageEntryBase } from '../protocol-entry-base.entity';
import {
	OperationMessageAssignedAlertGroup,
	OperationMessageAssignedUnit,
} from './operation-message.value-objects';


@ObjectType()
export class OperationStartedMessageLocation {
	@Field()
	@AutoMap()
	@IsString()
	name: string;

	@Field()
	@AutoMap()
	@IsString()
	street: string;

	@Field()
	@AutoMap()
	@IsString()
	city: string;

	@Field()
	@AutoMap()
	@IsString()
	postalCode: string;
}

@ObjectType()
export class OperationStartedMessagePayload {
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

	@Field()
	@AutoMap()
	@IsString()
	@IsNotEmpty()
	start: Date;

	@Field()
	@AutoMap()
	location: OperationStartedMessageLocation;

	@Field()
	@AutoMap()
	@IsString()
	@IsNotEmpty()
	alarmKeyword: string;

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
export class OperationStartedMessage extends ProtocolMessageEntryBase {
	@Field(() => OperationStartedMessagePayload)
	@AutoMap()
	payload: OperationStartedMessagePayload;
}
