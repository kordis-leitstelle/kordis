import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { RescueStationEntityDTO } from '../../core/repository/rescue-station-deployment.repository';
import { RescueStationFilterArgs } from '../controller/rescue-station-filter.args';
import { RescueStationDocumentDTO } from '../repository/deployment/rescue-station-deployment.repository';

@Injectable()
export class RescueStationDtoMapperProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, RescueStationFilterArgs, RescueStationEntityDTO);
			createMap(mapper, RescueStationEntityDTO, RescueStationDocumentDTO);
		};
	}
}
