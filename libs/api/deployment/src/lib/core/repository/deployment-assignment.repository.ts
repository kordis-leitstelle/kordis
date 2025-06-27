import { DbSessionProvider } from '@kordis/api/shared';

import {
	BaseDeploymentEntity,
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../entity/deployment.entity';

export const DEPLOYMENT_ASSIGNMENT_REPOSITORY = Symbol(
	'DEPLOYMENT_ASSIGNMENT_REPOSITORY',
);

export interface DeploymentAssignmentRepository {
	getAssignment(
		orgId: string,
		entityId: string,
		uow?: DbSessionProvider,
	): Promise<BaseDeploymentEntity | null>;

	getAssignments(
		orgId: string,
		entityIds: string[],
		uow?: DbSessionProvider | undefined,
	): Promise<Record<string, BaseDeploymentEntity | null>>;

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
