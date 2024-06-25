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
import { ProtocolMessageEntryBaseProfile } from '../protocol-entity.mapper-profile';

@Injectable()
export class RescueStationSignOffMessagePayloadEntityProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationSignOffMessagePayloadDocument,
				RescueStationSignOffMessagePayload,
			);
		};
	}
}

@Injectable()
export class RescueStationSignOffMessageEntityProfile extends ProtocolMessageEntryBaseProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationSignOffMessageDocument,
				RescueStationSignOffMessage,
			);
		};
	}
}
