import { DbSessionProvider } from '@kordis/api/shared';

import { DeploymentAlertGroup } from '../entity/deployment.entity';

export const UNIT_ASSIGNMENT_REPOSITORY = Symbol('UNIT_ASSIGNMENT_REPOSITORY');

export interface UnitAssignmentRepository {
	removeAlertGroupAssignmentsByAlertGroups(
		orgId: string,
		alertGroupIds: string[],
		uow?: DbSessionProvider,
	): Promise<void>;

	removeAlertGroupAssignmentsFromUnits(
		orgId: string,
		unitIds: string[],
		uow?: DbSessionProvider,
	): Promise<void>;

	setAlertGroupAssignment(
		orgId: string,
		unitIds: string[],
		alertGroupId: string,
		uow?: DbSessionProvider | undefined,
	): Promise<void>;

	getAlertGroupOfUnit(
		orgId: string,
		unitId: string,
	): Promise<DeploymentAlertGroup | null>;
}
