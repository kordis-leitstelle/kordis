import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../entity/deployment.entity';
import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';
import {
	GetUnassignedEntitiesHandler,
	GetUnassignedEntitiesQuery,
} from './get-unassigned-entities.query';

describe('GetUnassignedEntitiesHandler', () => {
	let handler: GetUnassignedEntitiesHandler;
	const mockDeploymentAssignmentRepository =
		createMock<DeploymentAssignmentRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetUnassignedEntitiesHandler,
				{
					provide: DEPLOYMENT_ASSIGNMENT_REPOSITORY,
					useValue: mockDeploymentAssignmentRepository,
				},
			],
		}).compile();

		handler = module.get<GetUnassignedEntitiesHandler>(
			GetUnassignedEntitiesHandler,
		);
	});

	it('should find unassigned entities by orgId', async () => {
		const orgId = 'orgId';
		const command = new GetUnassignedEntitiesQuery(orgId);

		const mockDeploymentUnit = new DeploymentUnit();
		(mockDeploymentUnit as any).id = 'unitDeploymentId';
		const mockDeploymentAlertGroup = new DeploymentAlertGroup();
		(mockDeploymentAlertGroup as any).id = 'alertGroupDeploymentId';
		mockDeploymentAssignmentRepository.getUnassigned.mockResolvedValue([
			mockDeploymentUnit,
			mockDeploymentAlertGroup,
		]);

		const result = await handler.execute(command);

		expect(
			mockDeploymentAssignmentRepository.getUnassigned,
		).toHaveBeenCalledWith(orgId);
		expect(result).toEqual([mockDeploymentUnit, mockDeploymentAlertGroup]);
	});
});
