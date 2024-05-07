import { DbSessionProvider } from '@kordis/api/shared';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../entity/deployment.entity';
import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';

export const DEPLOYMENT_ASSIGNMENT_REPOSITORY = Symbol(
	'DEPLOYMENT_ASSIGNMENT_REPOSITORY',
);

export interface DeploymentAssignmentRepository {
	getAssignment(
		orgId: string,
		entityId: string,
	): Promise<RescueStationDeploymentEntity | null>;

	removeAssignmentsOfDeployment(
		orgId: string,
		deploymentId: string,
		uow?: DbSessionProvider | undefined,
	): Promise<void>;

	assignEntitiesToDeployment(
		orgId: string,
		deploymentId: string,
		entityIds: string[],
		uow?: DbSessionProvider | undefined,
	): Promise<void>;

	getUnassigned(
		orgId: string,
	): Promise<(DeploymentUnit | DeploymentAlertGroup)[]>;
}
