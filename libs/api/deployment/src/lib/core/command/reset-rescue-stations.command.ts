import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import { RescueStationStrength } from '../entity/rescue-station-deployment.entity';
import { RescueStationsResetEvent } from '../event/rescue-stations-reset.event';
import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../repository/rescue-station-deployment.repository';

export class ResetRescueStationsCommand {
	constructor(readonly orgId: string) {}
}

@CommandHandler(ResetRescueStationsCommand)
export class ResetRescueStationsHandler
	implements ICommandHandler<ResetRescueStationsCommand>
{
	constructor(
		@Inject(RESCUE_STATION_DEPLOYMENT_REPOSITORY)
		private readonly rescueStationDeploymentRepository: RescueStationDeploymentRepository,
		@Inject(DEPLOYMENT_ASSIGNMENT_REPOSITORY)
		private readonly deploymentsAssignmentsRepository: DeploymentAssignmentRepository,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uow: UnitOfWorkService,
		private readonly eventBus: EventBus,
	) {}

	async execute({ orgId }: ResetRescueStationsCommand): Promise<void> {
		await this.uow.asTransaction(async (uow) => {
			const rescueStations =
				await this.rescueStationDeploymentRepository.findByOrgId(
					orgId,
					undefined,
					uow,
				);

			// remove assignments of all rescue stations
			await this.deploymentsAssignmentsRepository.removeAssignmentsOfDeployments(
				orgId,
				rescueStations.map((rescueStation) => rescueStation.id),
				uow,
			);

			// reset all rescue stations (sign out, reset note and strength)
			await this.rescueStationDeploymentRepository.updateAll(
				orgId,
				{
					signedIn: false,
					note: '',
					strength: plainToInstance(RescueStationStrength, {
						leaders: 0,
						helpers: 0,
						subLeaders: 0,
					}),
				},
				uow,
			);
		}, 3);

		this.eventBus.publish(new RescueStationsResetEvent(orgId));
	}
}
