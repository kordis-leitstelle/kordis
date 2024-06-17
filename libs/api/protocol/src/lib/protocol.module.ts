import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateCommunicationMessageHandler } from './core/command/create-communication-message.command';
import { GetProtocolEntriesHandler } from './core/query/get-protocol-entries.query';
import { PROTOCOL_ENTRY_REPOSITORY } from './core/repository/protocol-entry.repository';
import { CommunicationMessageResolver } from './infra/controller/communication-message.resolver';
import {
	ProtocolEntryResolver,
	RegisteredUnitResolver,
} from './infra/controller/protocol-entry.resolver';
import { ImplProtocolEntryRepository } from './infra/repository/protocol-entry.repository';
import { CommunicationMessageSchema } from './infra/schema/communication-message.schema';
import {
	ProtocolEntryBaseDocument,
	ProtocolEntryBaseSchema,
	ProtocolEntryType,
} from './infra/schema/protocol-entry-base.schema';
import { ProducerPartialProfile } from './mapper-profile/producer-partial.mapper-profile';
import {
	CommunicationMessageDocumentProfile,
	CommunicationMessagePayloadDocumentProfile,
} from './mapper-profile/protocol-document.mapper-profile';
import {
	CommunicationMessagePayloadProfile,
	CommunicationMessageProfile,
} from './mapper-profile/protocol-entity.mapper-profile';
import { ProtocolEntryMapper } from './mapper-profile/protocol-entry.mapper';
import { UnitPartialProfile } from './mapper-profile/unit-partial.mapper-profile';

const MAPPER_PROFILES = [
	UnitPartialProfile,
	ProducerPartialProfile,
	CommunicationMessageDocumentProfile,
	CommunicationMessagePayloadDocumentProfile,
	CommunicationMessageProfile,
	CommunicationMessagePayloadProfile,
];
const COMMAND_HANDLERS = [
	CreateCommunicationMessageHandler,
	GetProtocolEntriesHandler,
];
const RESOLVERS = [
	ProtocolEntryResolver,
	CommunicationMessageResolver,
	RegisteredUnitResolver,
];

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
	providers: [
		...MAPPER_PROFILES,
		...RESOLVERS,
		...COMMAND_HANDLERS,
		ProtocolEntryMapper,
		{
			provide: PROTOCOL_ENTRY_REPOSITORY,
			useClass: ImplProtocolEntryRepository,
		},
	],
})
export class ProtocolModule {}
