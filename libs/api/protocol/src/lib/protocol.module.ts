import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateCommunicationMessageHandler } from './core/command/create-communication-message.command';
import { RescueStationMessageFactory } from './core/command/helper/rescue-station-message.factory';
import { CreateOperationEndedMessageHandler } from './core/command/operation/create-operation-ended-message.command';
import { CreateOperationInvolvementsUpdatedMessageHandler } from './core/command/operation/create-operation-involvements-updated-message.command';
import { CreateOperationStartedMessageHandler } from './core/command/operation/create-operation-started-message.command';
import { CreateRescueStationSignOffMessageHandler } from './core/command/rescue-station/create-rescue-station-sign-off-message.command';
import { CreateRescueStationSignOnMessageHandler } from './core/command/rescue-station/create-rescue-station-sign-on-message.command';
import { CreateRescueStationUpdateMessageHandler } from './core/command/rescue-station/create-rescue-station-update-message.command';
import { GetByUnitInvolvementsHandler } from './core/query/get-by-unit-times.query';
import { GetProtocolEntriesHandler } from './core/query/get-protocol-entries.query';
import { PROTOCOL_ENTRY_REPOSITORY } from './core/repository/protocol-entry.repository';
import { CommunicationMessageResolver } from './infra/controller/communication-message.resolver';
import { OperationProtocolResolver } from './infra/controller/operation-protocol.resolver';
import {
	ProtocolEntryResolver,
	RegisteredUnitResolver,
} from './infra/controller/protocol-entry.resolver';
import { ImplProtocolEntryRepository } from './infra/repository/protocol-entry.repository';
import { CommunicationMessageSchema } from './infra/schema/communication/communication-message.schema';
import { OperationEndedMessageSchema } from './infra/schema/operation/operation-ended-message.schema';
import { OperationInvolvementsUpdatedMessageSchema } from './infra/schema/operation/operation-involvements-updated-message.schema';
import { OperationStartedMessageSchema } from './infra/schema/operation/operation-started-message.schema';
import {
	ProtocolEntryBaseDocument,
	ProtocolEntryBaseSchema,
} from './infra/schema/protocol-entry-base.schema';
import { ProtocolEntryType } from './infra/schema/protocol-entry-type.enum';
import { RescueStationSignOffMessageSchema } from './infra/schema/rescue-station/rescue-station-sign-off-message.schema';
import { RescueStationSignOnMessageSchema } from './infra/schema/rescue-station/rescue-station-sign-on-message.schema';
import { RescueStationUpdateMessageSchema } from './infra/schema/rescue-station/rescue-station-updated-message.schema';
import { ProtocolDocumentPayloadMapperProfiler } from './mapper-profile/document/document-payload.mapper-profile';
import {
	CommunicationDetailsDocumentProfile,
	DocumentMapperProfile,
} from './mapper-profile/document/document.mapper-profile';
import { ProtocolEntityPayloadMapperProfiler } from './mapper-profile/entity/entity-payload.mapper-profile';
import {
	CommunicationDetailsEntityProfile,
	EntityMapperProfile,
} from './mapper-profile/entity/entity.mapper-profile';
import { ProducerPartialProfile } from './mapper-profile/producer-partial.mapper-profile';
import { ProtocolEntryMapper } from './mapper-profile/protocol-entry.mapper';
import { UnitPartialProfile } from './mapper-profile/unit-partial.mapper-profile';

const MAPPER_PROFILES = [
	ProtocolDocumentPayloadMapperProfiler,
	ProtocolEntityPayloadMapperProfiler,
	ProducerPartialProfile,
	CommunicationDetailsDocumentProfile,
	CommunicationDetailsEntityProfile,
	DocumentMapperProfile,
	EntityMapperProfile,
	ProtocolEntryMapper,
	UnitPartialProfile,
];
const COMMAND_HANDLERS = [
	CreateCommunicationMessageHandler,
	CreateOperationInvolvementsUpdatedMessageHandler,
	CreateOperationEndedMessageHandler,
	CreateOperationStartedMessageHandler,
	CreateRescueStationSignOffMessageHandler,
	CreateRescueStationSignOnMessageHandler,
	CreateRescueStationUpdateMessageHandler,
	GetByUnitInvolvementsHandler,
	GetProtocolEntriesHandler,
];
const RESOLVERS = [
	CommunicationMessageResolver,
	OperationProtocolResolver,
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
					{
						name: ProtocolEntryType.OPERATION_STARTED_ENTRY,
						schema: OperationStartedMessageSchema,
					},
					{
						name: ProtocolEntryType.OPERATION_ASSIGNMENTS_UPDATED_ENTRY,
						schema: OperationInvolvementsUpdatedMessageSchema,
					},
					{
						name: ProtocolEntryType.OPERATION_ENDED_ENTRY,
						schema: OperationEndedMessageSchema,
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
