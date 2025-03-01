import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

import { ProtocolMessageEntryBase } from '../protocol-entry-base.entity';

@ObjectType()
export class OperationEndedMessagePayload {
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
}

@ObjectType()
export class OperationEndedMessage extends ProtocolMessageEntryBase {
	@Field(() => OperationEndedMessagePayload)
	@AutoMap()
	payload: OperationEndedMessagePayload;
}
