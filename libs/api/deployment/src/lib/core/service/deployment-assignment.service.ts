import { Inject, Injectable } from '@nestjs/common';

import { DbSessionProvider } from '@kordis/api/shared';

import { OperationDeploymentEntity } from '../entity/operation-deplyoment.entity';
import { UnitsAssignedToOperationException } from '../exception/units-assigned-to-operation.exception';
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

	async removeAssignmentsOfDeployment(
		orgId: string,
		deploymentId: string,
		uow?: DbSessionProvider,
	): Promise<void> {
		// first remove all assignments
		await this.deploymentAssignmentRepository.removeAssignmentsOfDeployment(
			orgId,
			deploymentId,
			uow,
		);
	}

	/**
	 * Asserts that no units are currently assigned to an operation.
	 * @param unitIds The unit ids to check for assignments.
	 * @param orgId The organization id.
	 * @param uow An optional unit of work.
	 * @throws UnitsAssignedToOperationException if any of the units are assigned to an operation.
	 */
	async assertNoActiveOperationAssignment(
		unitIds: string[],
		orgId: string,
		uow?: DbSessionProvider,
	): Promise<void> {
		const assignedToOperation: { unitId: string; opId: string }[] = [];

		for (const unit of unitIds) {
			const assignment =
				await this.deploymentAssignmentRepository.getAssignment(
					orgId,
					unit,
					uow,
				);
			if (assignment && assignment instanceof OperationDeploymentEntity) {
				assignedToOperation.push({
					unitId: unit,
					opId: assignment.operation.id,
				});
			}
		}

		if (assignedToOperation.length > 0) {
			throw new UnitsAssignedToOperationException(assignedToOperation);
		}
	}

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

		// first remove all assignments
		await this.removeAssignmentsOfDeployment(orgId, deploymentId, uow);

		// remove all alert group assignments of the units, example: alertgroup A is assigned away from a deployment, but leaves behind units, these need to be unassigned from the alert group
		await this.unitAssignmentRepository.removeAssignmentsFromAlertGroups(
			orgId,
			alertGroupIds,
			uow,
		);

		// all newly assigned units (those that are part of an alert group or directly assigned) need to be unassigned from all previous alert groups
		await this.unitAssignmentRepository.removeAlertGroupFromUnits(
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
