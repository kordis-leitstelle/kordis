import { Mapper, createMap, forMember, mapFrom } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import { DeploymentAlertGroupAggregate } from '../repository/deployment/abstract-deployment.repository';
import { UnitAssignmentDocument } from '../schema/deployment-assignment.schema';

@Injectable()
export class DeploymentAssignmentProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap<UnitAssignmentDocument, DeploymentUnit>(
				mapper,
				UnitAssignmentDocument,
				DeploymentUnit,
				forMember(
					(s) => s.unit,
					mapFrom((s) => ({
						id: s.entityId,
					})),
				),
			);
			createMap<DeploymentAlertGroupAggregate, DeploymentAlertGroup>(
				mapper,
				DeploymentAlertGroupAggregate,
				DeploymentAlertGroup,
				forMember(
					(s) => s.alertGroup,
					mapFrom((s) => ({
						id: s.entityId,
					})),
				),
				forMember(
					(s) => s.assignedUnits,
					mapFrom((s) =>
						s.assignedUnitIds.map((id) => ({
							unit: {
								id,
							},
						})),
					),
				),
			);
		};
	}
}
