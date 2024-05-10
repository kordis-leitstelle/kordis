import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

import { ProtocolCommunicationEntryBase } from './protocol-entry-base.entity';

@ObjectType()
export class CommunicationMessagePayload {
	@Field()
	@AutoMap()
	@IsString()
	@IsNotEmpty()
	message: string;
}

@ObjectType()
export class CommunicationMessage extends ProtocolCommunicationEntryBase {
	@Field(() => CommunicationMessagePayload)
	@AutoMap()
	override payload: CommunicationMessagePayload;
}
