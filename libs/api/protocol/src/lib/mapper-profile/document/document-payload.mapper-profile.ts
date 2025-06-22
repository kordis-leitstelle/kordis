import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { CommunicationMessagePayload } from '../../core/entity/protocol-entries/communication-message.entity';
import { OperationEndedMessagePayload } from '../../core/entity/protocol-entries/operation/operation-ended-message.entity';
import { OperationInvolvementsUpdatedMessagePayload } from '../../core/entity/protocol-entries/operation/operation-involvements-updated-message.entity';
import {
	OperationMessageAssignedAlertGroup,
	OperationMessageAssignedUnit,
} from '../../core/entity/protocol-entries/operation/operation-message.value-objects';
import {
	OperationStartedMessageLocation,
	OperationStartedMessagePayload,
} from '../../core/entity/protocol-entries/operation/operation-started-message.entity';
import {
	RescueStationMessageAssignedAlertGroup,
	RescueStationMessageAssignedUnit,
	RescueStationMessagePayload,
	RescueStationMessageStrength,
} from '../../core/entity/protocol-entries/rescue-station/rescue-station-message-payload.entity';
import { RescueStationSignOffMessagePayload } from '../../core/entity/protocol-entries/rescue-station/rescue-station-sign-off-message.entity';
import { CommunicationMessagePayloadDocument } from '../../infra/schema/communication/communication-message.schema';
import {
	OperationMessageAssignedAlertGroupDocument,
	OperationMessageAssignedUnitDocument,
} from '../../infra/schema/operation/operation-assignment-message.schema';
import { OperationEndedMessagePayloadDocument } from '../../infra/schema/operation/operation-ended-message.schema';
import { OperationInvolvementsUpdatedMessagePayloadDocument } from '../../infra/schema/operation/operation-involvements-updated-message.schema';
import {
	OperationStartedMessageLocationDocument,
	OperationStartedMessagePayloadDocument,
} from '../../infra/schema/operation/operation-started-message.schema';
import {
	RescueStationMessageAssignedAlertGroupDocument,
	RescueStationMessageAssignedUnitDocument,
	RescueStationMessagePayloadDocument,
	RescueStationMessageStrengthDocument,
} from '../../infra/schema/rescue-station/rescue-station-message-payload.schema';
import { RescueStationSignOffMessagePayloadDocument } from '../../infra/schema/rescue-station/rescue-station-sign-off-message.schema';

@Injectable()
export class ProtocolDocumentPayloadMapperProfiler extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationMessagePayload,
				RescueStationMessagePayloadDocument,
			);
			createMap(
				mapper,
				RescueStationSignOffMessagePayload,
				RescueStationSignOffMessagePayloadDocument,
			);
			createMap(
				mapper,
				CommunicationMessagePayload,
				CommunicationMessagePayloadDocument,
			);
			createMap(
				mapper,
				OperationStartedMessagePayload,
				OperationStartedMessagePayloadDocument,
			);
			createMap(
				mapper,
				OperationEndedMessagePayload,
				OperationEndedMessagePayloadDocument,
			);
			createMap(
				mapper,
				OperationInvolvementsUpdatedMessagePayload,
				OperationInvolvementsUpdatedMessagePayloadDocument,
			);
			createMap(
				mapper,
				OperationMessageAssignedUnit,
				OperationMessageAssignedUnitDocument,
			);
			createMap(
				mapper,
				OperationMessageAssignedAlertGroup,
				OperationMessageAssignedAlertGroupDocument,
			);

			createMap(
				mapper,
				OperationStartedMessageLocation,
				OperationStartedMessageLocationDocument,
			);

			createMap(
				mapper,
				RescueStationMessageStrength,
				RescueStationMessageStrengthDocument,
			);
			createMap(
				mapper,
				RescueStationMessageAssignedUnit,
				RescueStationMessageAssignedUnitDocument,
			);
			createMap(
				mapper,
				RescueStationMessageAssignedAlertGroup,
				RescueStationMessageAssignedAlertGroupDocument,
			);
		};
	}
}
