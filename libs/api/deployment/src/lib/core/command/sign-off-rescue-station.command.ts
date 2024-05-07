import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import { RescueStationStrength } from '../entity/rescue-station-deployment.entity';
import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../repository/rescue-station-deployment.repository';

export class SignOffRescueStationCommand {
	constructor(
		readonly orgId: string,
		readonly rescueStationId: string,
	) {}
}

@CommandHandler(SignOffRescueStationCommand)
export class SignOffRescueStationHandler
	implements ICommandHandler<SignOffRescueStationCommand>
{
	constructor(
		@Inject(RESCUE_STATION_DEPLOYMENT_REPOSITORY)
		private readonly rescueStationDeploymentRepository: RescueStationDeploymentRepository,
		@Inject(DEPLOYMENT_ASSIGNMENT_REPOSITORY)
		private readonly deploymentAssignmentRepository: DeploymentAssignmentRepository,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uow: UnitOfWorkService,
	) {}

	async execute({
		orgId,
		rescueStationId,
	}: SignOffRescueStationCommand): Promise<void> {
		await this.uow.asTransaction(async (uow) => {
			await this.deploymentAssignmentRepository.removeAssignmentsOfDeployment(
				orgId,
				rescueStationId,
				uow,
			);

			await this.rescueStationDeploymentRepository.updateOne(
				orgId,
				rescueStationId,
				{
					signedIn: false,
					note: '',
					strength: RescueStationStrength.makeDefault(),
				},
				uow,
			);
		});
	}
}
