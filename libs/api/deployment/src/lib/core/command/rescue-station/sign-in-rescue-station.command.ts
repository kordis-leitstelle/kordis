import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../../repository/rescue-station-deployment.repository';
import { DeploymentAssignmentService } from '../../service/deployment-assignment.service';
import { createStrengthFromCommand } from '../../service/strength-from-command.factory';

export class SignInRescueStationCommand {
	constructor(
		readonly orgId: string,
		readonly rescueStationId: string,
		readonly strength: {
			readonly leaders: number;
			readonly subLeaders: number;
			readonly helpers: number;
		},
		readonly note: string,
		readonly assignedUnitIds: string[],
		readonly assignedAlertGroups: {
			readonly alertGroupId: string;
			readonly unitIds: string[];
		}[],
	) {}
}

@CommandHandler(SignInRescueStationCommand)
export class SignInRescueStationHandler
	implements ICommandHandler<SignInRescueStationCommand>
{
	constructor(
		@Inject(RESCUE_STATION_DEPLOYMENT_REPOSITORY)
		private readonly rescueStationDeploymentRepository: RescueStationDeploymentRepository,
		private readonly deploymentAssignmentService: DeploymentAssignmentService,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uow: UnitOfWorkService,
	) {}

	async execute(command: SignInRescueStationCommand): Promise<void> {
		await this.uow.asTransaction(async (uow) => {
			await this.deploymentAssignmentService.assertNoActiveOperationAssignment(
				[
					...command.assignedUnitIds,
					...command.assignedAlertGroups.flatMap(
						(alertGroup) => alertGroup.unitIds,
					),
				],
				command.orgId,
				uow,
			);
			await this.deploymentAssignmentService.setAssignmentsOfDeployment(
				command.orgId,
				command.rescueStationId,
				command.assignedUnitIds,
				command.assignedAlertGroups,
				uow,
			);

			const strength = createStrengthFromCommand(command.strength);
			await strength.validOrThrow();

			await this.rescueStationDeploymentRepository.updateOne(
				command.orgId,
				command.rescueStationId,
				{
					signedIn: true,
					note: command.note,
					strength: strength,
				},
				uow,
			);
		}, 3);
	}
}
