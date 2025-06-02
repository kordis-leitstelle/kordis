import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

import { UserProducer } from '../partials/producer-partial.entity';
import { ProtocolEntryBase } from './protocol-entry.entity';

@ObjectType()
export class CommunicationMessagePayload {
	@Field()
	@AutoMap()
	@IsString()
	@IsNotEmpty()
	message: string;
}

@ObjectType()
export class CommunicationMessage extends ProtocolEntryBase {
	@Field(() => CommunicationMessagePayload)
	@AutoMap()
	declare payload: CommunicationMessagePayload;

	@Field(() => UserProducer)
	declare producer: UserProducer;
}
