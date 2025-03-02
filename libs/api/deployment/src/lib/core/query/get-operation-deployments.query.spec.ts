import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { OperationDeploymentEntity } from '../entity/operation-deplyoment.entity';
import {
	OPERATION_DEPLOYMENT_REPOSITORY,
	OperationDeploymentRepository,
} from '../repository/operation-deployment.repository';
import {
	GetOperationDeploymentsHandler,
	GetOperationDeploymentsQuery,
} from './get-operation-deployments.query';

describe('GetOperationDeploymentsHandler', () => {
	let handler: GetOperationDeploymentsHandler;
	const mockOperationDeploymentRepository =
		createMock<OperationDeploymentRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetOperationDeploymentsHandler,
				{
					provide: OPERATION_DEPLOYMENT_REPOSITORY,
					useValue: mockOperationDeploymentRepository,
				},
			],
		}).compile();

		handler = module.get<GetOperationDeploymentsHandler>(
			GetOperationDeploymentsHandler,
		);
	});

	it('should get operation deployments from repository', async () => {
		const orgId = 'orgId';
		const command = new GetOperationDeploymentsQuery(orgId);
		const expected = [
			{ id: '1', orgId },
			{ id: '2', orgId },
		] as OperationDeploymentEntity[];
		mockOperationDeploymentRepository.findByOrgId.mockResolvedValue(expected);

		await expect(handler.execute(command)).resolves.toEqual(expected);

		expect(mockOperationDeploymentRepository.findByOrgId).toHaveBeenCalledWith(
			orgId,
		);
	});
});
