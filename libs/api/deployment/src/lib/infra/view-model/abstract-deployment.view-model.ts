import { createUnionType } from '@nestjs/graphql';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';

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

export interface DeploymentViewModel {
	assignments: (DeploymentUnit | DeploymentAlertGroup)[];
}
