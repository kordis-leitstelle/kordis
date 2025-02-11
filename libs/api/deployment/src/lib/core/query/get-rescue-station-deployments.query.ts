import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
	RescueStationEntityDTO,
} from '../repository/rescue-station-deployment.repository';

export class GetRescueStationDeploymentsQuery {
	constructor(
		readonly orgId: string,
		readonly filter?: RescueStationEntityDTO,
	) {}
}

@QueryHandler(GetRescueStationDeploymentsQuery)
export class GetRescueStationsDeploymentsHandler
	implements IQueryHandler<GetRescueStationDeploymentsQuery>
{
	constructor(
		@Inject(RESCUE_STATION_DEPLOYMENT_REPOSITORY)
		private rescueStationDeploymentRepository: RescueStationDeploymentRepository,
	) {}

	async execute({
		orgId,
		filter,
	}: GetRescueStationDeploymentsQuery): Promise<
		RescueStationDeploymentEntity[]
	> {
		return this.rescueStationDeploymentRepository.findByOrgId(orgId, filter);
	}
}
