import { DbSessionProvider } from '@kordis/api/shared';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../entity/deployment.entity';
import { OperationDeploymentEntity } from '../entity/operation-deplyoment.entity';
import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';

export const DEPLOYMENT_ASSIGNMENT_REPOSITORY = Symbol(
	'DEPLOYMENT_ASSIGNMENT_REPOSITORY',
);

export interface DeploymentAssignmentRepository {
	getAssignment(
		orgId: string,
		entityId: string,
	): Promise<RescueStationDeploymentEntity | OperationDeploymentEntity | null>;

	removeAssignmentsOfDeployments(
		orgId: string,
		ids: string[],
		uow?: DbSessionProvider,
	): Promise<void>;

	removeAssignmentsOfDeployments(
		orgId: string,
		ids: string[],
		uow?: DbSessionProvider,
	): Promise<void>;

	removeAssignmentsOfDeployment(
		orgId: string,
		id: string,
		uow?: DbSessionProvider,
	): Promise<void>;

	assignEntitiesToDeployment(
		orgId: string,
		id: string,
		entityIds: string[],
		uow?: DbSessionProvider,
	): Promise<void>;

	getUnassigned(
		orgId: string,
	): Promise<(DeploymentUnit | DeploymentAlertGroup)[]>;
}
