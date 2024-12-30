import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { DeploymentUnit } from '../entity/deployment.entity';
import {
	UNIT_ASSIGNMENT_REPOSITORY,
	UnitAssignmentRepository,
} from '../repository/unit-assignment.repository';

export class GetAlertGroupAssignedUnitsQuery {
	constructor(
		readonly orgId: string,
		readonly alertGroupId: string,
	) {}
}

@QueryHandler(GetAlertGroupAssignedUnitsQuery)
export class GetAlertGroupAssignedUnitsHandler {
	constructor(
		@Inject(UNIT_ASSIGNMENT_REPOSITORY)
		private readonly repository: UnitAssignmentRepository,
	) {}

	async execute({
		orgId,
		alertGroupId,
	}: GetAlertGroupAssignedUnitsQuery): Promise<DeploymentUnit[]> {
		return this.repository.getUnitsOfAlertGroup(orgId, alertGroupId);
	}
}
