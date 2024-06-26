import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';
import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';
import {
	GetCurrentAssignmentOfEntity,
	GetUnitAssignmentHandlerHandler,
} from './get-current-assignment-of-entity.query';

describe('GetUnitAssignmentHandlerHandler', () => {
	let handler: GetUnitAssignmentHandlerHandler;
	const mockDeploymentAssignmentRepository =
		createMock<DeploymentAssignmentRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetUnitAssignmentHandlerHandler,
				{
					provide: DEPLOYMENT_ASSIGNMENT_REPOSITORY,
					useValue: mockDeploymentAssignmentRepository,
				},
			],
		}).compile();

		handler = module.get<GetUnitAssignmentHandlerHandler>(
			GetUnitAssignmentHandlerHandler,
		);
	});

	it('should get assignment of entity', async () => {
		const orgId = 'orgId';
		const entityId = 'entityId';
		const command = new GetCurrentAssignmentOfEntity(orgId, entityId);

		const mockDeployment = new RescueStationDeploymentEntity();
		mockDeployment.note = 'foo';
		mockDeploymentAssignmentRepository.getAssignment.mockResolvedValue(
			mockDeployment,
		);

		const result = await handler.execute(command);

		expect(
			mockDeploymentAssignmentRepository.getAssignment,
		).toHaveBeenCalledWith(orgId, entityId);
		expect(result).toEqual(mockDeployment);
	});
});
