import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

import { ProtocolEntryBase } from '../protocol-entry.entity';

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
export class OperationEndedMessage extends ProtocolEntryBase {
	@Field(() => OperationEndedMessagePayload)
	@AutoMap()
	declare payload: OperationEndedMessagePayload;
}
