import { DbSessionProvider } from '@kordis/api/shared';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../entity/deployment.entity';

export const UNIT_ASSIGNMENT_REPOSITORY = Symbol('UNIT_ASSIGNMENT_REPOSITORY');

export interface UnitAssignmentRepository {
	removeAssignmentsFromAlertGroups(
		orgId: string,
		alertGroupIds: string[],
		uow?: DbSessionProvider,
	): Promise<void>;

	removeAlertGroupFromUnits(
		orgId: string,
		unitIds: string[],
		uow?: DbSessionProvider,
	): Promise<void>;

	getUnitsOfAlertGroup(
		orgId: string,
		alertGroupId: string,
	): Promise<DeploymentUnit[]>;

	setAlertGroupAssignment(
		orgId: string,
		unitIds: string[],
		alertGroupId: string,
		uow?: DbSessionProvider | undefined,
	): Promise<void>;

	findAlertGroupOfUnit(
		orgId: string,
		unitId: string,
	): Promise<DeploymentAlertGroup | null>;
}
