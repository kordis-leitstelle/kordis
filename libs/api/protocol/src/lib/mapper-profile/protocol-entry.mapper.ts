import { Mapper, ModelIdentifier } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { CommunicationMessage } from '../core/entity/protocol-entries/communication-message.entity';
import { OperationEndedMessage } from '../core/entity/protocol-entries/operation/operation-ended-message.entity';
import { OperationInvolvementsUpdatedMessage } from '../core/entity/protocol-entries/operation/operation-involvements-updated-message.entity';
import { OperationStartedMessage } from '../core/entity/protocol-entries/operation/operation-started-message.entity';
import { ProtocolEntryBase } from '../core/entity/protocol-entries/protocol-entry.entity';
import { RescueStationSignOffMessage } from '../core/entity/protocol-entries/rescue-station/rescue-station-sign-off-message.entity';
import { RescueStationSignOnMessage } from '../core/entity/protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { RescueStationUpdateMessage } from '../core/entity/protocol-entries/rescue-station/rescue-station-update-message.entity';
import { CommunicationMessageDocument } from '../infra/schema/communication/communication-message.schema';
import { OperationEndedMessageDocument } from '../infra/schema/operation/operation-ended-message.schema';
import { OperationInvolvementsUpdatedMessageDocument } from '../infra/schema/operation/operation-involvements-updated-message.schema';
import { OperationStartedMessageDocument } from '../infra/schema/operation/operation-started-message.schema';
import { ProtocolEntryBaseDocument } from '../infra/schema/protocol-entry-base.schema';
import { ProtocolEntryType } from '../infra/schema/protocol-entry-type.enum';
import { RescueStationSignOffMessageDocument } from '../infra/schema/rescue-station/rescue-station-sign-off-message.schema';
import { RescueStationSignOnMessageDocument } from '../infra/schema/rescue-station/rescue-station-sign-on-message.schema';
import { RescueStationUpdateMessageDocument } from '../infra/schema/rescue-station/rescue-station-updated-message.schema';

export const ENTITY_CONSTRUCTORS: {
	[key in ProtocolEntryType]: {
		document: ModelIdentifier;
		entity: ModelIdentifier;
	};
} = Object.freeze({
	[ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY]: {
		document: CommunicationMessageDocument,
		entity: CommunicationMessage,
	},
	[ProtocolEntryType.RESCUE_STATION_SIGN_ON_ENTRY]: {
		document: RescueStationSignOnMessageDocument,
		entity: RescueStationSignOnMessage,
	},
	[ProtocolEntryType.RESCUE_STATION_SIGN_OFF_ENTRY]: {
		document: RescueStationSignOffMessageDocument,
		entity: RescueStationSignOffMessage,
	},
	[ProtocolEntryType.RESCUE_STATION_UPDATE_ENTRY]: {
		document: RescueStationUpdateMessageDocument,
		entity: RescueStationUpdateMessage,
	},
	[ProtocolEntryType.OPERATION_STARTED_ENTRY]: {
		document: OperationStartedMessageDocument,
		entity: OperationStartedMessage,
	},
	[ProtocolEntryType.OPERATION_ENDED_ENTRY]: {
		document: OperationEndedMessageDocument,
		entity: OperationEndedMessage,
	},
	[ProtocolEntryType.OPERATION_ASSIGNMENTS_UPDATED_ENTRY]: {
		document: OperationInvolvementsUpdatedMessageDocument,
		entity: OperationInvolvementsUpdatedMessage,
	},
});

export const DOCUMENT_CONSTRUCTORS: {
	[key: string]: ModelIdentifier;
} = Object.freeze({
	[CommunicationMessage.name]: CommunicationMessageDocument,
	[RescueStationSignOnMessage.name]: RescueStationSignOnMessageDocument,
	[RescueStationSignOffMessage.name]: RescueStationSignOffMessageDocument,
	[RescueStationUpdateMessage.name]: RescueStationUpdateMessageDocument,
	[OperationStartedMessage.name]: OperationStartedMessageDocument,
	[OperationEndedMessage.name]: OperationEndedMessageDocument,
	[OperationInvolvementsUpdatedMessage.name]:
		OperationInvolvementsUpdatedMessageDocument,
});

@Injectable()
export class ProtocolEntryMapper {
	constructor(
		@Inject(getMapperToken())
		private readonly mapper: Mapper,
	) {}

	mapDocumentToEntity(doc: ProtocolEntryBaseDocument): ProtocolEntryBase {
		const constructors = ENTITY_CONSTRUCTORS[doc.type];
		return this.mapper.map(doc, constructors.document, constructors.entity);
	}

	mapEntityToDocument(entity: ProtocolEntryBase): ProtocolEntryBaseDocument {
		return this.mapper.map(
			entity,
			entity.constructor as ModelIdentifier<ProtocolEntryBase>,
			DOCUMENT_CONSTRUCTORS[entity.constructor.name],
		);
	}
}
