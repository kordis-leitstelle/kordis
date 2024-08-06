import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	OperationStartedMessage,
	OperationStartedMessageLocation,
	OperationStartedMessagePayload,
} from '../../core/entity/protocol-entries/operation/operation-started-message.entity';
import {
	OperationStartedMessageDocument,
	OperationStartedMessageLocationDocument,
	OperationStartedMessagePayloadDocument,
} from '../../infra/schema/operation/operation-started-message.schema';

@Injectable()
export class OperationStartedMessagePayloadDocumentProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				OperationStartedMessagePayload,
				OperationStartedMessagePayloadDocument,
			);
			createMap(
				mapper,
				OperationStartedMessageLocation,
				OperationStartedMessageLocationDocument,
			);
			createMap(
				mapper,
				OperationStartedMessage,
				OperationStartedMessageDocument,
			);
		};
	}
}
