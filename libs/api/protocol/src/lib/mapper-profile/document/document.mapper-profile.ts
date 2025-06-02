import {
	Mapper,
	MappingConfiguration,
	createMap,
	extend,
	forMember,
	mapDefer,
	mapFrom,
	mapWith,
} from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	SystemProducer,
	UserProducer,
} from '../../core/entity/partials/producer-partial.entity';
import { CommunicationMessage } from '../../core/entity/protocol-entries/communication-message.entity';
import { OperationEndedMessage } from '../../core/entity/protocol-entries/operation/operation-ended-message.entity';
import { OperationAssignmentsUpdatedMessage } from '../../core/entity/protocol-entries/operation/operation-involvements-updated-message.entity';
import { OperationStartedMessage } from '../../core/entity/protocol-entries/operation/operation-started-message.entity';
import {
	CommunicationDetails,
	ProtocolEntryBase,
} from '../../core/entity/protocol-entries/protocol-entry.entity';
import { RescueStationSignOffMessage } from '../../core/entity/protocol-entries/rescue-station/rescue-station-sign-off-message.entity';
import { RescueStationSignOnMessage } from '../../core/entity/protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { RescueStationUpdateMessage } from '../../core/entity/protocol-entries/rescue-station/rescue-station-update-message.entity';
import { CommunicationMessageDocument } from '../../infra/schema/communication/communication-message.schema';
import { OperationAssignmentsUpdatedMessageDocument } from '../../infra/schema/operation/operation-assignments-updated-message.schema';
import { OperationEndedMessageDocument } from '../../infra/schema/operation/operation-ended-message.schema';
import { OperationStartedMessageDocument } from '../../infra/schema/operation/operation-started-message.schema';
import {
	SystemProducerDocument,
	UserProducerDocument,
} from '../../infra/schema/producer-partial.schema';
import {
	CommunicationDetailsDocument,
	ProtocolEntryBaseDocument,
} from '../../infra/schema/protocol-entry-base.schema';
import { RescueStationSignOffMessageDocument } from '../../infra/schema/rescue-station/rescue-station-sign-off-message.schema';
import { RescueStationSignOnMessageDocument } from '../../infra/schema/rescue-station/rescue-station-sign-on-message.schema';
import { RescueStationUpdateMessageDocument } from '../../infra/schema/rescue-station/rescue-station-updated-message.schema';
import { unitEntityToDocumentMapper } from '../unit-partial.mapper-profile';

export abstract class Base extends AutomapperProfile {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			...super.mappingConfigurations,
			extend(
				createMap(
					this.mapper,
					ProtocolEntryBase,
					ProtocolEntryBaseDocument,
					forMember(
						(d) => d.communicationDetails,
						mapWith(
							CommunicationDetailsDocument,
							CommunicationDetails,
							(s) => s.communicationDetails,
						),
					),
					forMember(
						(d) => d.producer,
						mapDefer((s) => {
							if (s.producer instanceof UserProducer)
								return mapWith(
									UserProducerDocument,
									UserProducer,
									(s) => s.producer,
								);
							return mapWith(
								SystemProducerDocument,
								SystemProducer,
								(s) => s.producer,
							);
						}),
					),
				),
			),
		];
	}
}

@Injectable()
export class CommunicationDetailsDocumentProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				CommunicationDetails,
				CommunicationDetailsDocument,
				forMember(
					(d) => d.sender,
					mapFrom((s) => unitEntityToDocumentMapper(this.mapper, s.sender)),
				),
				forMember(
					(d) => d.recipient,
					mapFrom((s) => unitEntityToDocumentMapper(this.mapper, s.recipient)),
				),
			);
		};
	}
}

@Injectable()
export class DocumentMapperProfile extends Base {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, CommunicationMessage, CommunicationMessageDocument);
			createMap(
				mapper,
				RescueStationSignOnMessage,
				RescueStationSignOnMessageDocument,
			);
			createMap(
				mapper,
				RescueStationSignOffMessage,
				RescueStationSignOffMessageDocument,
			);
			createMap(
				mapper,
				RescueStationUpdateMessage,
				RescueStationUpdateMessageDocument,
			);
			createMap(
				mapper,
				OperationStartedMessage,
				OperationStartedMessageDocument,
			);
			createMap(mapper, OperationEndedMessage, OperationEndedMessageDocument);
			createMap(
				mapper,
				OperationAssignmentsUpdatedMessage,
				OperationAssignmentsUpdatedMessageDocument,
			);
		};
	}
}
