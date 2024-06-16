import {
	Mapper,
	MappingConfiguration,
	createMap,
	extend,
	forMember,
	mapFrom,
	mapWith,
} from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { UserProducer } from '../core/entity/partials/producer-partial.entity';
import {
	CommunicationMessage,
	CommunicationMessagePayload,
} from '../core/entity/protocol-entries/communication-message.entity';
import {
	ProtocolCommunicationEntryBase,
	ProtocolEntryBase,
} from '../core/entity/protocol-entries/protocol-entry-base.entity';
import {
	CommunicationMessageDocument,
	CommunicationMessagePayloadDocument,
} from '../infra/schema/communication-message.schema';
import { UserProducerDocument } from '../infra/schema/producer-partial.schema';
import {
	ProtocolCommunicationEntryBaseDocument,
	ProtocolEntryBaseDocument,
} from '../infra/schema/protocol-entry-base.schema';
import { unitDocumentToEntityMapper } from './unit-partial.mapper-profile';

export abstract class ProtocolBaseToEntity extends AutomapperProfile {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			extend(
				createMap(
					this.mapper,
					ProtocolEntryBaseDocument,
					ProtocolEntryBase,
					forMember(
						(d) => d.id,
						mapFrom((s) => s._id?.toString()),
					),
					forMember(
						(d) => d.sender,
						mapFrom((s) => unitDocumentToEntityMapper(this.mapper, s.sender)),
					),
				),
			),
		];
	}
}

export abstract class BaseCommunicationMessageToEntityProfile extends ProtocolBaseToEntity {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			...super.mappingConfigurations,
			extend(
				createMap(
					this.mapper,
					ProtocolCommunicationEntryBaseDocument,
					ProtocolCommunicationEntryBase,
					forMember(
						(d) => d.recipient,
						mapFrom((s) =>
							unitDocumentToEntityMapper(this.mapper, s.recipient),
						),
					),
					forMember(
						(d) => d.producer,
						mapWith(UserProducer, UserProducerDocument, (s) => s.producer),
					),
				),
			),
		];
	}
}

@Injectable()
export class CommunicationMessagePayloadToEntityProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				CommunicationMessagePayloadDocument,
				CommunicationMessagePayload,
			);
		};
	}
}

@Injectable()
export class CommunicationMessageToEntityProfile extends BaseCommunicationMessageToEntityProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, CommunicationMessageDocument, CommunicationMessage);
		};
	}
}
