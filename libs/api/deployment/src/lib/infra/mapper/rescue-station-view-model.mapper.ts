import {
	Mapper,
	MappingProfile,
	createMap,
	forMember,
	mapFrom,
} from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { RescueStationDeploymentEntity } from '../../core/entity/rescue-station-deployment.entity';
import { RescueStationDeploymentViewModel } from '../rescue-station.view-model';

@Injectable()
export class RescueStationViewModelProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationDeploymentEntity,
				RescueStationDeploymentViewModel,
				forMember(
					(d) => d.assignments,
					mapFrom((s) => {
						return [...s.assignedUnits, ...s.assignedAlertGroups];
					}),
				),
				forMember(
					(d) => d.defaultUnits,
					mapFrom((s) => s.defaultUnits),
				),
			);
		};
	}
}
