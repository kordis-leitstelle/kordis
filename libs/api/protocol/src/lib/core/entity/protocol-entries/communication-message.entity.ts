import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

import { ProtocolMessageEntryBase } from './protocol-entry-base.entity';

@ObjectType()
export class CommunicationMessagePayload {
	@Field()
	@AutoMap()
	@IsString()
	@IsNotEmpty()
	message: string;
}

@ObjectType()
export class CommunicationMessage extends ProtocolMessageEntryBase {
	@Field(() => CommunicationMessagePayload)
	@AutoMap()
	payload: CommunicationMessagePayload;
}
