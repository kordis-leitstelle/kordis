import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../entity/deployment.entity';
import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';

export class GetUnassignedEntitiesQuery {
	constructor(readonly orgId: string) {}
}

@QueryHandler(GetUnassignedEntitiesQuery)
export class GetUnassignedEntitiesHandler
	implements IQueryHandler<GetUnassignedEntitiesQuery>
{
	constructor(
		@Inject(DEPLOYMENT_ASSIGNMENT_REPOSITORY)
		private readonly deploymentAssignmentRepository: DeploymentAssignmentRepository,
	) {}

	execute({
		orgId,
	}: GetUnassignedEntitiesQuery): Promise<
		(DeploymentUnit | DeploymentAlertGroup)[]
	> {
		return this.deploymentAssignmentRepository.getUnassigned(orgId);
	}
}
