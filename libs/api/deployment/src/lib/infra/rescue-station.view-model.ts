import { Field, ObjectType, createUnionType } from '@nestjs/graphql';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../core/entity/deployment.entity';
import { RescueStationDeploymentEntity } from '../core/entity/rescue-station-deployment.entity';

export const DeploymentAssignment = createUnionType({
	name: 'DeploymentAssignment',
	types: () => [DeploymentUnit, DeploymentAlertGroup] as const,
	resolveType: (o) => {
		if (o instanceof DeploymentUnit) {
			return DeploymentUnit.name;
		} else {
			return DeploymentAlertGroup.name;
		}
	},
});

@ObjectType('RescueStationDeployment')
export class RescueStationDeploymentViewModel extends RescueStationDeploymentEntity {
	@Field(() => [DeploymentAssignment])
	assignments: (DeploymentUnit | DeploymentAlertGroup)[];
}
