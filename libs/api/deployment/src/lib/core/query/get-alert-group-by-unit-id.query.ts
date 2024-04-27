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

	// todo: checken ob das hier geht! aggregate
	async execute({
		orgId,
		unitId,
	}: GetAlertGroupByUnitIdQuery): Promise<DeploymentAlertGroup | null> {
		return this.repository.getAlertGroupOfUnit(orgId, unitId);
	}
}
