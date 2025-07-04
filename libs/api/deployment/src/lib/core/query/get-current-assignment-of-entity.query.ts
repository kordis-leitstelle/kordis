import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BaseDeploymentEntity } from '../entity/deployment.entity';
import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';

export class GetCurrentAssignmentOfEntity {
	constructor(
		readonly orgId: string,
		readonly entityId: string,
	) {}
}

@QueryHandler(GetCurrentAssignmentOfEntity)
export class GetUnitAssignmentHandlerHandler
	implements IQueryHandler<GetCurrentAssignmentOfEntity>
{
	constructor(
		@Inject(DEPLOYMENT_ASSIGNMENT_REPOSITORY)
		private readonly repository: DeploymentAssignmentRepository,
	) {}

	execute({
		orgId,
		entityId,
	}: GetCurrentAssignmentOfEntity): Promise<BaseDeploymentEntity | null> {
		return this.repository.getAssignment(orgId, entityId);
	}
}
