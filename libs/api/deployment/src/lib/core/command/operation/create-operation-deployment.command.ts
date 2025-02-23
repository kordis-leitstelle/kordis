import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import { OperationDeploymentCreatedEvent } from '../../event/operation-deployment-created.event';
import {
	OPERATION_DEPLOYMENT_REPOSITORY,
	OperationDeploymentRepository,
} from '../../repository/operation-deployment.repository';
import { DeploymentAssignmentService } from '../../service/deployment-assignment.service';

export class CreateOperationDeploymentCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly assignedUnitIds: string[],
		readonly assignedAlertGroups: {
			alertGroupId: string;
			unitIds: string[];
		}[],
	) {}
}

@CommandHandler(CreateOperationDeploymentCommand)
export class CreateOperationDeploymentHandler
	implements ICommandHandler<CreateOperationDeploymentCommand>
{
	constructor(
		private readonly deploymentAssignmentService: DeploymentAssignmentService,
		@Inject(OPERATION_DEPLOYMENT_REPOSITORY)
		private readonly operationDeploymentRepository: OperationDeploymentRepository,
		@Inject(UNIT_OF_WORK_SERVICE) private readonly uow: UnitOfWorkService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: CreateOperationDeploymentCommand): Promise<void> {
		await this.uow.asTransaction(async (uow) => {
			const { id } = await this.operationDeploymentRepository.create(
				command.orgId,
				command.operationId,
				uow,
			);

			await this.deploymentAssignmentService.setAssignmentsOfDeployment(
				command.orgId,
				id,
				command.assignedUnitIds,
				command.assignedAlertGroups,
				uow,
			);

			this.eventBus.publish(
				new OperationDeploymentCreatedEvent(command.orgId, id),
			);
		});
	}
}
