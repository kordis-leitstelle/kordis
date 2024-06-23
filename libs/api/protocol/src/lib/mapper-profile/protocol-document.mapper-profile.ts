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
	ProtocolEntryBase,
	ProtocolMessageEntryBase,
} from '../core/entity/protocol-entries/protocol-entry-base.entity';
import {
	CommunicationMessageDocument,
	CommunicationMessagePayloadDocument,
} from '../infra/schema/communication-message.schema';
import { UserProducerDocument } from '../infra/schema/producer-partial.schema';
import {
	ProtocolEntryBaseDocument,
	ProtocolMessageEntryBaseDocument,
} from '../infra/schema/protocol-entry-base.schema';
import { unitEntityToDocumentMapper } from './unit-partial.mapper-profile';

export abstract class ProtocolEntryBaseDocumentProfile extends AutomapperProfile {
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

export abstract class ProtocolMessageEntryBaseDocumentProfile extends ProtocolEntryBaseDocumentProfile {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			...super.mappingConfigurations,
			extend(
				createMap(
					this.mapper,
					ProtocolMessageEntryBase,
					ProtocolMessageEntryBaseDocument,
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
export class CommunicationMessagePayloadDocumentProfile extends AutomapperProfile {
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
export class CommunicationMessageDocumentProfile extends ProtocolMessageEntryBaseDocumentProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, CommunicationMessage, CommunicationMessageDocument);
		};
	}
}
