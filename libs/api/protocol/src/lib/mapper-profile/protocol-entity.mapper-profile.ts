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

import { BaseMapperProfile } from '@kordis/api/shared';

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
import { unitDocumentToEntityMapper } from './unit-partial.mapper-profile';

export abstract class ProtocolEntryBaseProfile extends BaseMapperProfile {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			...super.mappingConfigurations,
			extend(
				createMap(
					this.mapper,
					ProtocolEntryBaseDocument,
					ProtocolEntryBase,
					forMember(
						(d) => d.sender,
						mapFrom((s) => unitDocumentToEntityMapper(this.mapper, s.sender)),
					),
				),
			),
		];
	}
}

export abstract class ProtocolMessageEntryBaseProfile extends ProtocolEntryBaseProfile {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			...super.mappingConfigurations,
			extend(
				createMap(
					this.mapper,
					ProtocolMessageEntryBaseDocument,
					ProtocolMessageEntryBase,
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
export class CommunicationMessagePayloadProfile extends AutomapperProfile {
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
export class CommunicationMessageProfile extends ProtocolMessageEntryBaseProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, CommunicationMessageDocument, CommunicationMessage);
		};
	}
}
