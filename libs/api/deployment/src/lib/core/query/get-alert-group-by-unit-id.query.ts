import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { DeploymentAlertGroup } from '../entity/deployment.entity';
import {
	UNIT_ASSIGNMENT_REPOSITORY,
	UnitAssignmentRepository,
} from '../repository/unit-assignment.repository';

export class GetAlertGroupByUnitIdQuery {
	constructor(
		readonly orgId: string,
		readonly unitId: string,
	) {}
}

@QueryHandler(GetAlertGroupByUnitIdQuery)
export class GetAlertGroupByUnitIdHandler {
	constructor(
		@Inject(UNIT_ASSIGNMENT_REPOSITORY)
		private readonly repository: UnitAssignmentRepository,
	) {}

	async execute({
		orgId,
		unitId,
	}: GetAlertGroupByUnitIdQuery): Promise<DeploymentAlertGroup | null> {
		return this.repository.findAlertGroupOfUnit(orgId, unitId);
	}
}
