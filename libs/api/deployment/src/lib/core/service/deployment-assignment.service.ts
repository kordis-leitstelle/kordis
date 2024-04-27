import { Inject, Injectable } from '@nestjs/common';

import { DbSessionProvider } from '@kordis/api/shared';

import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';
import {
	UNIT_ASSIGNMENT_REPOSITORY,
	UnitAssignmentRepository,
} from '../repository/unit-assignment.repository';

@Injectable()
export class DeploymentAssignmentService {
	constructor(
		@Inject(DEPLOYMENT_ASSIGNMENT_REPOSITORY)
		private readonly deploymentAssignmentRepository: DeploymentAssignmentRepository,
		@Inject(UNIT_ASSIGNMENT_REPOSITORY)
		private readonly unitAssignmentRepository: UnitAssignmentRepository,
	) {}

	/**
	 * Sets the assignments of a deployment by completely removing all previous assignments and assigning the new units and alert groups.
	 * Keeps units of alert groups that are not assigned to the deployment in their old deployment but without the alert group assignment.
	 * @param orgId The organization id.
	 * @param deploymentId The deployment id to assign the units and alert groups to.
	 * @param unitIds The unit ids to assign to the deployment.
	 * @param alertGroups The alert groups with their respective unit ids to assign to the deployment.
	 * @param uow An optional unit of work.
	 */
	async setAssignmentsOfDeployment(
		orgId: string,
		deploymentId: string,
		unitIds: string[],
		alertGroups: {
			alertGroupId: string;
			unitIds: string[];
		}[],
		uow?: DbSessionProvider | undefined,
	): Promise<void> {
		const alertGroupIds: string[] = []; // alert group ids to assign
		const alertGroupUnitIds: string[][] = []; // alert group unit ids to assign, 1:1 index mapping with alertGroupIds
		const flatAlertGroupUnitIds: string[] = []; // a flat list of all unit ids of all alert groups
		for (const alertGroup of alertGroups) {
			alertGroupIds.push(alertGroup.alertGroupId);
			alertGroupUnitIds.push(alertGroup.unitIds);
			flatAlertGroupUnitIds.push(...alertGroup.unitIds);
		}

		// wenn eine einheit weggeordnet wird von einer alertgruppe, dann muss sie auch aus der alertgruppe entfernt werden

		// first remove all assignments
		await this.deploymentAssignmentRepository.removeAssignmentsOfDeployment(
			orgId,
			deploymentId,
			uow,
		);

		// remove all alert group assignments of the units, example: alertgroup A is assigned away from an deployment, but leaves behind units, these need to be unassigned from the alert group
		await this.unitAssignmentRepository.removeAlertGroupAssignmentsByAlertGroups(
			orgId,
			alertGroupIds,
			uow,
		);

		// all newly assigned units (those that are part of an alert group or directly assigned) need to be unassigned from all previous alert groups
		await this.unitAssignmentRepository.removeAlertGroupAssignmentsFromUnits(
			orgId,
			[...flatAlertGroupUnitIds, ...unitIds],
			uow,
		);

		// assign units to alert groups
		for (let i = 0; i < alertGroupIds.length; i++) {
			await this.unitAssignmentRepository.setAlertGroupAssignment(
				orgId,
				alertGroupUnitIds[i],
				alertGroupIds[i],
				uow,
			);
		}

		// assign units and alert groups to the deployment
		await this.deploymentAssignmentRepository.assignEntitiesToDeployment(
			orgId,
			deploymentId,
			[...unitIds, ...flatAlertGroupUnitIds, ...alertGroupIds],
			uow,
		);
	}
}
