import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';

import { OperationDeploymentEntity } from '../../entity/operation-deplyoment.entity';
import { OperationDeploymentUpdatedEvent } from '../../event/operation-deployment-updated.event';
import {
	OPERATION_DEPLOYMENT_REPOSITORY,
	OperationDeploymentRepository,
} from '../../repository/operation-deployment.repository';
import { DeploymentAssignmentService } from '../../service/deployment-assignment.service';
import {
	CreateOperationDeploymentCommand,
	CreateOperationDeploymentHandler,
} from './create-operation-deployment.command';

describe('CreateOperationDeploymentHandler', () => {
	let handler: CreateOperationDeploymentHandler;
	const mockDeploymentAssignmentService =
		createMock<DeploymentAssignmentService>();
	const mockDeploymentRepository = createMock<OperationDeploymentRepository>();
	const mockEventBus = createMock<EventBus>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateOperationDeploymentHandler,
				{
					provide: DeploymentAssignmentService,
					useValue: mockDeploymentAssignmentService,
				},
				{
					provide: OPERATION_DEPLOYMENT_REPOSITORY,
					useValue: mockDeploymentRepository,
				},
				{
					provide: EventBus,
					useValue: mockEventBus,
				},
				uowMockProvider(),
			],
		}).compile();

		handler = module.get<CreateOperationDeploymentHandler>(
			CreateOperationDeploymentHandler,
		);
	});

	it('should set assignments and publish OperationDeploymentCreatedEvent', async () => {
		const command = new CreateOperationDeploymentCommand(
			'orgId',
			'operationId',
			['unitId1', 'unitId2'],
			[
				{
					alertGroupId: 'alertGroupId',
					unitIds: ['unitId3', 'unitId4'],
				},
			],
		);

		const deploymentId = 'deploymentId';
		mockDeploymentRepository.create.mockResolvedValueOnce({
			id: deploymentId,
		} as OperationDeploymentEntity);

		await handler.execute(command);

		expect(
			mockDeploymentAssignmentService.setAssignmentsOfDeployment,
		).toHaveBeenCalledWith(
			command.orgId,
			deploymentId,
			command.assignedUnitIds,
			command.assignedAlertGroups,
			expect.anything(),
		);
		expect(mockEventBus.publish).toHaveBeenCalledWith(
			new OperationDeploymentUpdatedEvent(command.orgId, deploymentId),
		);
	});
});
