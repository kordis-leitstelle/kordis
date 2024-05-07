import {
	Mapper,
	MappingProfile,
	createMap,
	forMember,
	mapWith,
} from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	BaseDeploymentEntity,
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import {
	DeploymentAggregate,
	DeploymentAlertGroupAggregate,
} from '../repository/deployment/abstract-deployment.repository';
import { UnitAssignmentDocument } from '../schema/deployment-assignment.schema';

// Mapping from the aggregate result (document) to the entity
@Injectable()
export class DeploymentAggregateProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper: Mapper): void => {
			createMap<DeploymentAggregate, BaseDeploymentEntity>(
				mapper,
				DeploymentAggregate,
				BaseDeploymentEntity,
				forMember(
					(d) => d.assignedUnits,
					mapWith(DeploymentUnit, UnitAssignmentDocument, (s) => s.units),
				),
				forMember(
					(d) => d.assignedAlertGroups,
					mapWith(
						DeploymentAlertGroup,
						DeploymentAlertGroupAggregate,
						(s) => s.alertGroups,
					),
				),
			);
		};
	}
}
