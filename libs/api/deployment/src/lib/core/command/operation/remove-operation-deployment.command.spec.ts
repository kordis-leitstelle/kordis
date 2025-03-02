import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';

import { OperationDeploymentEntity } from '../../entity/operation-deplyoment.entity';
import { OperationDeploymentRemovedEvent } from '../../event/operation-deployment-removed.event';
import {
	OPERATION_DEPLOYMENT_REPOSITORY,
	OperationDeploymentRepository,
} from '../../repository/operation-deployment.repository';
import { DeploymentAssignmentService } from '../../service/deployment-assignment.service';
import {
	RemoveOperationDeploymentCommand,
	RemoveOperationDeploymentHandler,
} from './remove-operation-deployment.command';

describe('RemoveOperationDeploymentHandler', () => {
	let handler: RemoveOperationDeploymentHandler;
	let mockDeploymentRepository: DeepMocked<OperationDeploymentRepository>;
	let mockDeploymentAssignmentService: DeepMocked<DeploymentAssignmentService>;
	let mockEventBus: DeepMocked<EventBus>;

	beforeEach(async () => {
		mockDeploymentRepository = createMock<OperationDeploymentRepository>();
		mockDeploymentAssignmentService = createMock<DeploymentAssignmentService>();
		mockEventBus = createMock<EventBus>();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RemoveOperationDeploymentHandler,
				{
					provide: OPERATION_DEPLOYMENT_REPOSITORY,
					useValue: mockDeploymentRepository,
				},
				{
					provide: DeploymentAssignmentService,
					useValue: mockDeploymentAssignmentService,
				},
				{ provide: EventBus, useValue: mockEventBus },
				uowMockProvider(),
			],
		}).compile();

		handler = module.get<RemoveOperationDeploymentHandler>(
			RemoveOperationDeploymentHandler,
		);
	});

	it('should remove operation deployment and publish event', async () => {
		const command = new RemoveOperationDeploymentCommand(
			'orgId',
			'operationId',
		);
		const deploymentId = 'deploymentId';

		mockDeploymentRepository.findByOperationId.mockResolvedValueOnce({
			id: deploymentId,
		} as OperationDeploymentEntity);

		await handler.execute(command);

		expect(
			mockDeploymentAssignmentService.removeAssignmentsOfDeployment,
		).toHaveBeenCalledWith('orgId', deploymentId, expect.anything());
		expect(mockDeploymentRepository.remove).toHaveBeenCalledWith(
			'orgId',
			'operationId',
			expect.anything(),
		);
		expect(mockEventBus.publish).toHaveBeenCalledWith(
			new OperationDeploymentRemovedEvent('orgId', deploymentId),
		);
	});
});
