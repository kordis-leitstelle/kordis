import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
	RescueStationEntityDTO,
} from '../repository/rescue-station-deployment.repository';

export class GetDeploymentsQuery {
	constructor(
		readonly orgId: string,
		readonly filter?: RescueStationEntityDTO,
	) {}
}

@QueryHandler(GetDeploymentsQuery)
export class GetDeploymentsHandler
	implements IQueryHandler<GetDeploymentsQuery>
{
	constructor(
		@Inject(RESCUE_STATION_DEPLOYMENT_REPOSITORY)
		private rescueStationDeploymentRepository: RescueStationDeploymentRepository,
	) {}

	async execute({
		orgId,
		filter,
	}: GetDeploymentsQuery): Promise<RescueStationDeploymentEntity[]> {
		return this.rescueStationDeploymentRepository.findByOrgId(orgId, filter);
	}
}
