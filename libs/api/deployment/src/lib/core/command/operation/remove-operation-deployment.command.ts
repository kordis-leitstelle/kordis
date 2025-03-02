import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import { OperationDeploymentRemovedEvent } from '../../event/operation-deployment-removed.event';
import {
	OPERATION_DEPLOYMENT_REPOSITORY,
	OperationDeploymentRepository,
} from '../../repository/operation-deployment.repository';
import { DeploymentAssignmentService } from '../../service/deployment-assignment.service';

export class RemoveOperationDeploymentCommand {
	constructor(
		readonly organizationId: string,
		readonly operationId: string,
	) {}
}

@CommandHandler(RemoveOperationDeploymentCommand)
export class RemoveOperationDeploymentHandler
	implements ICommandHandler<RemoveOperationDeploymentCommand>
{
	constructor(
		@Inject(OPERATION_DEPLOYMENT_REPOSITORY)
		private readonly deploymentRepository: OperationDeploymentRepository,
		private readonly deploymentAssignmentService: DeploymentAssignmentService,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uow: UnitOfWorkService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: RemoveOperationDeploymentCommand): Promise<void> {
		await this.uow.asTransaction(async (uow) => {
			const { id: deploymentId } =
				await this.deploymentRepository.findByOperationId(
					command.organizationId,
					command.operationId,
					uow,
				);

			await this.deploymentAssignmentService.removeAssignmentsOfDeployment(
				command.organizationId,
				deploymentId,
				uow,
			);

			await this.deploymentRepository.remove(
				command.organizationId,
				command.operationId,
				uow,
			);

			this.eventBus.publish(
				new OperationDeploymentRemovedEvent(
					command.organizationId,
					deploymentId,
				),
			);
		});
	}
}
