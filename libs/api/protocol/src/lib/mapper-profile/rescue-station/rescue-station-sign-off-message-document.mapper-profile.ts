import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	RescueStationSignOffMessage,
	RescueStationSignOffMessagePayload,
} from '../../core/entity/protocol-entries/rescue-station/rescue-station-sign-off-message.entity';
import {
	RescueStationSignOffMessageDocument,
	RescueStationSignOffMessagePayloadDocument,
} from '../../infra/schema/rescue-station/rescue-station-sign-off-message.schema';
import { ProtocolMessageEntryBaseDocumentProfile } from '../protocol-document.mapper-profile';

@Injectable()
export class RescueStationSignOffMessagePayloadDocumentProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationSignOffMessagePayload,
				RescueStationSignOffMessagePayloadDocument,
			);
		};
	}
}

@Injectable()
export class RescueStationSignOffMessageDocumentProfile extends ProtocolMessageEntryBaseDocumentProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationSignOffMessage,
				RescueStationSignOffMessageDocument,
			);
		};
	}
}
