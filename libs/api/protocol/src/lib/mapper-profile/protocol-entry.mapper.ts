import type { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { CommunicationMessage } from '../core/entity/protocol-entries/communication-message.entity';
import { ProtocolEntryBase } from '../core/entity/protocol-entries/protocol-entry-base.entity';
import { CommunicationMessageDocument } from '../infra/schema/communication-message.schema';
import {
	ProtocolEntryBaseDocument,
	ProtocolEntryType,
} from '../infra/schema/protocol-entry-base.schema';

@Injectable()
export class ProtocolEntryMapper {
	constructor(@Inject(getMapperToken()) private readonly mapper: Mapper) {}

	map(entity: ProtocolEntryBase): ProtocolEntryBaseDocument;
	map(document: ProtocolEntryBaseDocument): ProtocolEntryBase;
	map(
		object: ProtocolEntryBase | ProtocolEntryBaseDocument,
	): ProtocolEntryBaseDocument | ProtocolEntryBase {
		if (object instanceof ProtocolEntryBase) {
			return this.mapEntityToDocument(object);
		} else {
			return this.mapDocumentToEntity(object);
		}
	}

	private mapEntityToDocument(
		entity: ProtocolEntryBase,
	): ProtocolEntryBaseDocument {
		switch (true) {
			case entity instanceof CommunicationMessage:
				return this.mapper.map(
					entity,
					CommunicationMessage,
					CommunicationMessageDocument,
				);
			default:
				throw new Error(
					`Protocol Entity type ${entity.constructor.name} not supported by mapper`,
				);
		}
	}

	private mapDocumentToEntity(
		document: ProtocolEntryBaseDocument,
	): ProtocolEntryBase {
		switch (document.type) {
			case ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY:
				return this.mapper.map(
					document,
					CommunicationMessageDocument,
					CommunicationMessage,
				);
			default:
				throw new Error(
					`Protocol Document type ${document.type} not supported by mapper`,
				);
		}
	}
}
