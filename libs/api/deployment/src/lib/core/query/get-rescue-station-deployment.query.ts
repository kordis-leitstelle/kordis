import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../repository/rescue-station-deployment.repository';

export class GetRescueStationDeploymentQuery {
	constructor(
		readonly orgId: string,
		readonly id: string,
	) {}
}

@QueryHandler(GetRescueStationDeploymentQuery)
export class GetRescueStationDeploymentHandler
	implements
		IQueryHandler<
			GetRescueStationDeploymentQuery,
			RescueStationDeploymentEntity
		>
{
	constructor(
		@Inject(RESCUE_STATION_DEPLOYMENT_REPOSITORY)
		private readonly rescueStationDeploymentRepository: RescueStationDeploymentRepository,
	) {}

	async execute({
		orgId,
		id,
	}: GetRescueStationDeploymentQuery): Promise<RescueStationDeploymentEntity> {
		return this.rescueStationDeploymentRepository.findById(orgId, id);
	}
}
