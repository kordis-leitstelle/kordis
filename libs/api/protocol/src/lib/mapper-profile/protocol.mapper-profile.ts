import type { Mapper } from '@automapper/core';
import { createMap, forMember, mapFrom } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { UserProducer } from '../core/entity/partials/producer-partial.entity';
import {
	CommunicationMessage,
	CommunicationMessagePayload,
} from '../core/entity/protocol-entries/communication-message.entity';
import {
	CommunicationMessageDocument,
	CommunicationMessagePayloadDocument,
} from '../infra/schema/communication-message.schema';
import { UserProducerDocument } from '../infra/schema/producer-partial.schema';
import {
	unitDocumentToEntityMapper,
	unitEntityToDocumentMapper,
} from './unit-partial.mapper-profile';

@Injectable()
export class CommunicationMessageProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			// document --> entity
			createMap(
				mapper,
				CommunicationMessagePayloadDocument,
				CommunicationMessagePayload,
			);
			createMap(
				mapper,
				CommunicationMessageDocument,
				CommunicationMessage,
				forMember(
					(d) => d.id,
					mapFrom((s) => s._id?.toString()),
				),
				forMember(
					(d) => d.sender,
					mapFrom((s) => unitDocumentToEntityMapper(mapper, s.sender)),
				),
				forMember(
					(d) => d.recipient,
					mapFrom((s) => unitDocumentToEntityMapper(mapper, s.recipient)),
				),
				forMember(
					(d) => d.producer,
					mapFrom((s) =>
						mapper.map(s.producer, UserProducerDocument, UserProducer),
					),
				),
				forMember(
					(d) => d.payload,
					mapFrom((s) =>
						mapper.map(
							s.payload,
							CommunicationMessagePayloadDocument,
							CommunicationMessagePayload,
						),
					),
				),
			);

			// entity --> document
			createMap(
				mapper,
				CommunicationMessagePayload,
				CommunicationMessagePayloadDocument,
			);
			createMap(
				mapper,
				CommunicationMessage,
				CommunicationMessageDocument,
				forMember(
					(d) => d.sender,
					mapFrom((s) => unitEntityToDocumentMapper(mapper, s.sender)),
				),
				forMember(
					(d) => d.recipient,
					mapFrom((s) => unitEntityToDocumentMapper(mapper, s.recipient)),
				),
				forMember(
					(d) => d.producer,
					mapFrom((s) =>
						mapper.map(s.producer, UserProducer, UserProducerDocument),
					),
				),
			);
		};
	}
}
