import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import { OperationDeploymentUpdatedEvent } from '../../event/operation-deployment-updated.event';
import {
	OPERATION_DEPLOYMENT_REPOSITORY,
	OperationDeploymentRepository,
} from '../../repository/operation-deployment.repository';
import { DeploymentAssignmentService } from '../../service/deployment-assignment.service';

export class UpdateOperationAssignmentsCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly assignedUnitIds: string[],
		readonly assignedAlertGroups: {
			readonly alertGroupId: string;
			readonly unitIds: string[];
		}[],
	) {}
}

@CommandHandler(UpdateOperationAssignmentsCommand)
export class UpdateOperationAssignmentsHandler
	implements ICommandHandler<UpdateOperationAssignmentsCommand>
{
	constructor(
		private readonly deploymentAssignmentService: DeploymentAssignmentService,
		@Inject(OPERATION_DEPLOYMENT_REPOSITORY)
		private readonly deploymentRepository: OperationDeploymentRepository,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uow: UnitOfWorkService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: UpdateOperationAssignmentsCommand): Promise<void> {
		await this.uow.asTransaction(async (uow) => {
			const { id: deploymentId } =
				await this.deploymentRepository.findByOperationId(
					command.orgId,
					command.operationId,
					uow,
				);
			await this.deploymentAssignmentService.setAssignmentsOfDeployment(
				command.orgId,
				deploymentId,
				command.assignedUnitIds,
				command.assignedAlertGroups,
				uow,
			);

			this.eventBus.publish(
				new OperationDeploymentUpdatedEvent(command.orgId, deploymentId),
			);
		});
	}
}
