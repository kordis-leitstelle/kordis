import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OperationDeploymentEntity } from '../entity/operation-deplyoment.entity';
import {
	OPERATION_DEPLOYMENT_REPOSITORY,
	OperationDeploymentRepository,
} from '../repository/operation-deployment.repository';
import { GetRescueStationDeploymentsQuery } from './get-rescue-station-deployments.query';

export class GetOperationDeploymentsQuery {
	constructor(readonly orgId: string) {}
}

@QueryHandler(GetOperationDeploymentsQuery)
export class GetOperationDeploymentsHandler
	implements IQueryHandler<GetOperationDeploymentsQuery>
{
	constructor(
		@Inject(OPERATION_DEPLOYMENT_REPOSITORY)
		private readonly operationDeploymentRepository: OperationDeploymentRepository,
	) {}

	async execute({
		orgId,
	}: GetRescueStationDeploymentsQuery): Promise<OperationDeploymentEntity[]> {
		return this.operationDeploymentRepository.findByOrgId(orgId);
	}
}
