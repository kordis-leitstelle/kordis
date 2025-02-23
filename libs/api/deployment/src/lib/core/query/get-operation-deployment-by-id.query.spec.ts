import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { OperationDeploymentEntity } from '../entity/operation-deplyoment.entity';
import {
	OPERATION_DEPLOYMENT_REPOSITORY,
	OperationDeploymentRepository,
} from '../repository/operation-deployment.repository';
import {
	GetOperationDeploymentByIdHandler,
	GetOperationDeploymentByIdQuery,
} from './get-operation-deployment-by-id.query';

describe('GetOperationDeploymentByIdHandler', () => {
	let handler: GetOperationDeploymentByIdHandler;
	const mockOperationDeploymentRepository =
		createMock<OperationDeploymentRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetOperationDeploymentByIdHandler,
				{
					provide: OPERATION_DEPLOYMENT_REPOSITORY,
					useValue: mockOperationDeploymentRepository,
				},
			],
		}).compile();

		handler = module.get<GetOperationDeploymentByIdHandler>(
			GetOperationDeploymentByIdHandler,
		);
	});

	it('should get operation deployment from repository', async () => {
		const orgId = 'orgId';
		const unitId = 'unitId';
		const command = new GetOperationDeploymentByIdQuery(orgId, unitId);
		mockOperationDeploymentRepository.findById.mockResolvedValueOnce({
			id: 'operationDeploymentId',
		} as OperationDeploymentEntity);

		await expect(handler.execute(command)).resolves.toEqual({
			id: 'operationDeploymentId',
		});

		expect(mockOperationDeploymentRepository.findById).toHaveBeenCalledWith(
			orgId,
			unitId,
		);
	});
});
