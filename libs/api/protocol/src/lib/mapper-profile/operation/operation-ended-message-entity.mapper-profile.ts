import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	OperationEndedMessage,
	OperationEndedMessagePayload,
} from '../../core/entity/protocol-entries/operation/operation-ended-message.entity';
import {
	OperationEndedMessageDocument,
	OperationEndedMessagePayloadDocument,
} from '../../infra/schema/operation/operation-ended-message.schema';

@Injectable()
export class OperationEndedMessagePayloadDocumentProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				OperationEndedMessagePayloadDocument,
				OperationEndedMessagePayload,
			);
			createMap(mapper, OperationEndedMessageDocument, OperationEndedMessage);
		};
	}
}
