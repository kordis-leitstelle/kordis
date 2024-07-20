import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateCommunicationMessageHandler } from './core/command/create-communication-message.command';
import { RescueStationMessageFactory } from './core/command/helper/rescue-station-message.factory';
import { CreateRescueStationSignOffMessageHandler } from './core/command/rescue-station/create-rescue-station-sign-off-message.command';
import { CreateRescueStationSignOnMessageHandler } from './core/command/rescue-station/create-rescue-station-sign-on-message.command';
import { CreateRescueStationUpdateMessageHandler } from './core/command/rescue-station/create-rescue-station-update-message.command';
import { GetProtocolEntriesHandler } from './core/query/get-protocol-entries.query';
import { PROTOCOL_ENTRY_REPOSITORY } from './core/repository/protocol-entry.repository';
import { CommunicationMessageResolver } from './infra/controller/communication-message.resolver';
import {
	ProtocolEntryResolver,
	RegisteredUnitResolver,
} from './infra/controller/protocol-entry.resolver';
import { ImplProtocolEntryRepository } from './infra/repository/protocol-entry.repository';
import { CommunicationMessageSchema } from './infra/schema/communication/communication-message.schema';
import {
	ProtocolEntryBaseDocument,
	ProtocolEntryBaseSchema,
} from './infra/schema/protocol-entry-base.schema';
import { ProtocolEntryType } from './infra/schema/protocol-entry-type';
import { RescueStationSignOffMessageSchema } from './infra/schema/rescue-station/rescue-station-sign-off-message.schema';
import { RescueStationSignOnMessageSchema } from './infra/schema/rescue-station/rescue-station-sign-on-message.schema';
import { RescueStationUpdateMessageSchema } from './infra/schema/rescue-station/rescue-station-updated-message.schema';
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
import { RescueStationMessagePayloadDocumentProfile } from './mapper-profile/rescue-station/rescue-station-message-payload-document.mapper-profile';
import { RescueStationMessagePayloadProfile } from './mapper-profile/rescue-station/rescue-station-message-payload-entity.mapper-profile';
import {
	RescueStationSignOffMessageDocumentProfile,
	RescueStationSignOffMessagePayloadDocumentProfile,
} from './mapper-profile/rescue-station/rescue-station-sign-off-message-document.mapper-profile';
import {
	RescueStationSignOffMessageEntityProfile,
	RescueStationSignOffMessagePayloadEntityProfile,
} from './mapper-profile/rescue-station/rescue-station-sign-off-message-entity.mapper-profile';
import { RescueStationSignOnMessageDocumentProfile } from './mapper-profile/rescue-station/rescue-station-sign-on-message-document.mapper-profile';
import { RescueStationSignOnMessageEntityProfile } from './mapper-profile/rescue-station/rescue-station-sign-on-message-entity.mapper-profile';
import { RescueStationUpdateMessageDocumentProfile } from './mapper-profile/rescue-station/rescue-station-update-message-document.mapper-profile';
import { RescueStationUpdateMessageEntityProfile } from './mapper-profile/rescue-station/rescue-station-update-message-entity.mapper-profile';
import { UnitPartialProfile } from './mapper-profile/unit-partial.mapper-profile';

const MAPPER_PROFILES = [
	CommunicationMessageDocumentProfile,
	CommunicationMessagePayloadDocumentProfile,
	CommunicationMessagePayloadProfile,
	CommunicationMessageProfile,
	ProducerPartialProfile,
	ProtocolEntryMapper,
	RescueStationMessagePayloadDocumentProfile,
	RescueStationMessagePayloadProfile,
	RescueStationSignOffMessagePayloadDocumentProfile,
	RescueStationSignOffMessageDocumentProfile,
	RescueStationSignOffMessageEntityProfile,
	RescueStationSignOffMessagePayloadEntityProfile,
	RescueStationSignOnMessageDocumentProfile,
	RescueStationSignOnMessageEntityProfile,
	RescueStationUpdateMessageDocumentProfile,
	RescueStationUpdateMessageEntityProfile,
	UnitPartialProfile,
];
const COMMAND_HANDLERS = [
	CreateCommunicationMessageHandler,
	CreateRescueStationSignOffMessageHandler,
	CreateRescueStationSignOnMessageHandler,
	CreateRescueStationUpdateMessageHandler,
	GetProtocolEntriesHandler,
];
const RESOLVERS = [
	CommunicationMessageResolver,
	ProtocolEntryResolver,
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
					{
						name: ProtocolEntryType.RESCUE_STATION_SIGN_ON_ENTRY,
						schema: RescueStationSignOnMessageSchema,
					},
					{
						name: ProtocolEntryType.RESCUE_STATION_SIGN_OFF_ENTRY,
						schema: RescueStationSignOffMessageSchema,
					},
					{
						name: ProtocolEntryType.RESCUE_STATION_UPDATE_ENTRY,
						schema: RescueStationUpdateMessageSchema,
					},
				],
			},
		]),
	],
	providers: [
		...MAPPER_PROFILES,
		...RESOLVERS,
		...COMMAND_HANDLERS,
		{
			provide: PROTOCOL_ENTRY_REPOSITORY,
			useClass: ImplProtocolEntryRepository,
		},
		RescueStationMessageFactory,
	],
})
export class ProtocolModule {}
