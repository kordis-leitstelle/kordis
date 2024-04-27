import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';
import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';

export class GetDeployableEntityAssignment {
	constructor(
		readonly orgId: string,
		readonly entityId: string,
	) {}
}

@QueryHandler(GetDeployableEntityAssignment)
export class GetUnitAssignmentHandler
	implements IQueryHandler<GetDeployableEntityAssignment>
{
	constructor(
		@Inject(DEPLOYMENT_ASSIGNMENT_REPOSITORY)
		private readonly repository: DeploymentAssignmentRepository,
	) {}

	async execute({
		orgId,
		entityId,
	}: GetDeployableEntityAssignment): Promise<RescueStationDeploymentEntity | null> {
		return this.repository.getAssignment(orgId, entityId);
	}
}
