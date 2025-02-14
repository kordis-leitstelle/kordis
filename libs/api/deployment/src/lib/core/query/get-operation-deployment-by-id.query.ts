import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OperationDeploymentEntity } from '../entity/operation-deplyoment.entity';
import {
	OPERATION_DEPLOYMENT_REPOSITORY,
	OperationDeploymentRepository,
} from '../repository/operation-deployment.repository';

export class GetOperationDeploymentByIdQuery {
	constructor(
		readonly orgId: string,
		readonly deploymentId: string,
	) {}
}

@QueryHandler(GetOperationDeploymentByIdQuery)
export class GetOperationDeploymentByIdHandler
	implements IQueryHandler<GetOperationDeploymentByIdQuery>
{
	constructor(
		@Inject(OPERATION_DEPLOYMENT_REPOSITORY)
		private readonly operationDeploymentRepository: OperationDeploymentRepository,
	) {}

	async execute({
		orgId,
		deploymentId,
	}: GetOperationDeploymentByIdQuery): Promise<OperationDeploymentEntity> {
		return this.operationDeploymentRepository.findById(orgId, deploymentId);
	}
}
