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
import { unitEntityToDocumentMapper } from './unit-partial.mapper-profile';

export abstract class ProtocolBaseToDocument extends AutomapperProfile {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			extend(
				createMap(
					this.mapper,
					ProtocolEntryBase,
					ProtocolEntryBaseDocument,
					forMember(
						(d) => d.sender,
						mapFrom((s) => unitEntityToDocumentMapper(this.mapper, s.sender)),
					),
				),
			),
		];
	}
}

export abstract class BaseCommunicationMessageToDocumentProfile extends ProtocolBaseToDocument {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			...super.mappingConfigurations,
			extend(
				createMap(
					this.mapper,
					ProtocolCommunicationEntryBase,
					ProtocolCommunicationEntryBaseDocument,
					forMember(
						(d) => d.recipient,
						mapFrom((s) =>
							unitEntityToDocumentMapper(this.mapper, s.recipient),
						),
					),
					forMember(
						(d) => d.producer,
						mapWith(UserProducerDocument, UserProducer, (s) => s.producer),
					),
				),
			),
		];
	}
}

@Injectable()
export class CommunicationMessagePayloadToDocumentProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				CommunicationMessagePayload,
				CommunicationMessagePayloadDocument,
			);
		};
	}
}

@Injectable()
export class CommunicationMessageToDocumentProfile extends BaseCommunicationMessageToDocumentProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, CommunicationMessage, CommunicationMessageDocument);
		};
	}
}
