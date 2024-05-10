import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateCommunicationMessageHandler } from './core/command/create-communication-message.command';
import { GetProtocolEntriesHandler } from './core/query/get-protocol-entries.query';
import { PROTOCOL_ENTRY_REPOSITORY } from './core/repository/protocol-entry.repository';
import { CommunicationMessageResolver } from './infra/controller/communication-message.resolver';
import { ProtocolEntryResolver } from './infra/controller/protocol-entry.resolver';
import { ImplProtocolEntryRepository } from './infra/repository/protocol-entry.repository';
import { CommunicationMessageSchema } from './infra/schema/communication-message.schema';
import {
	ProtocolEntryBaseDocument,
	ProtocolEntryBaseSchema,
	ProtocolEntryType,
} from './infra/schema/protocol-entry-base.schema';
import { ProducerPartialProfile } from './mapper-profile/producer-partial.mapper-profile';
import { ProtocolEntryMapper } from './mapper-profile/protocol-entry.mapper';
import { CommunicationMessageProfile } from './mapper-profile/protocol.mapper-profile';
import { UnitPartialProfile } from './mapper-profile/unit-partial.mapper-profile';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: ProtocolEntryBaseDocument.name,
				schema: ProtocolEntryBaseSchema,
				discriminators: [
					{
						name: ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY,
						schema: CommunicationMessageSchema,
					},
				],
			},
		]),
	],
	controllers: [],
	providers: [
		UnitPartialProfile,
		ProducerPartialProfile,
		CommunicationMessageProfile,
		ProtocolEntryMapper,
		{
			provide: PROTOCOL_ENTRY_REPOSITORY,
			useClass: ImplProtocolEntryRepository,
		},
		ProtocolEntryResolver,
		CommunicationMessageResolver,
		CreateCommunicationMessageHandler,
		GetProtocolEntriesHandler,
	],
	exports: [],
})
export class ProtocolModule {}
