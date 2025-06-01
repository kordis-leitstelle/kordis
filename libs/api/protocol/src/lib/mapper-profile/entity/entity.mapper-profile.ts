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

import { BaseMapperProfile } from '@kordis/api/shared';

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
	ProducerType,
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
import { unitDocumentToEntityMapper } from '../unit-partial.mapper-profile';

export abstract class Base extends BaseMapperProfile {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			...super.mappingConfigurations,
			extend(
				createMap(
					this.mapper,
					ProtocolEntryBaseDocument,
					ProtocolEntryBase,
					forMember(
						(d) => d.communicationDetails,
						mapWith(
							CommunicationDetails,
							CommunicationDetailsDocument,
							(s) => s.communicationDetails,
						),
					),
					forMember(
						(d) => d.producer,
						mapDefer((s) => {
							if (s.producer.type === ProducerType.USER_PRODUCER)
								return mapWith(
									UserProducer,
									UserProducerDocument,
									(s) => s.producer,
								);
							return mapWith(
								SystemProducer,
								SystemProducerDocument,
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
export class CommunicationDetailsEntityProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				CommunicationDetailsDocument,
				CommunicationDetails,
				forMember(
					(d) => d.sender,
					mapFrom((s) => unitDocumentToEntityMapper(this.mapper, s.sender)),
				),
				forMember(
					(d) => d.recipient,
					mapFrom((s) => unitDocumentToEntityMapper(this.mapper, s.recipient)),
				),
			);
		};
	}
}

@Injectable()
export class EntityMapperProfile extends Base {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, CommunicationMessageDocument, CommunicationMessage);
			createMap(
				mapper,
				RescueStationSignOnMessageDocument,
				RescueStationSignOnMessage,
			);
			createMap(
				mapper,
				RescueStationSignOffMessageDocument,
				RescueStationSignOffMessage,
			);
			createMap(
				mapper,
				RescueStationUpdateMessageDocument,
				RescueStationUpdateMessage,
			);
			createMap(
				mapper,
				OperationStartedMessageDocument,
				OperationStartedMessage,
			);
			createMap(mapper, OperationEndedMessageDocument, OperationEndedMessage);
			createMap(
				mapper,
				OperationAssignmentsUpdatedMessageDocument,
				OperationAssignmentsUpdatedMessage,
			);
		};
	}
}
