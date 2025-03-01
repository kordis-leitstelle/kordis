import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { OperationEntity } from '../entity/operation.entity';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import {
	GetOperationsByOrgIdHandler,
	GetOperationsByOrgIdQuery,
} from './get-operations-by-org-id.query';

describe('GetOperationsByOrgIdHandler', () => {
	let handler: GetOperationsByOrgIdHandler;
	let mockRepository: jest.Mocked<OperationRepository>;

	beforeEach(async () => {
		mockRepository = createMock<OperationRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				GetOperationsByOrgIdHandler,
				{
					provide: OPERATION_REPOSITORY,
					useValue: mockRepository,
				},
			],
		}).compile();

		handler = moduleRef.get<GetOperationsByOrgIdHandler>(
			GetOperationsByOrgIdHandler,
		);
	});

	it('should get operations by org id', async () => {
		const orgId = 'org1';
		const query = new GetOperationsByOrgIdQuery(orgId);
		const op1 = new OperationEntity();
		op1.sign = 'sign1';
		const op2 = new OperationEntity();
		op2.sign = 'sign2';
		const mockOperations = [op1, op2];
		mockRepository.findByOrgId.mockResolvedValue(mockOperations);

		const result = await handler.execute(query);
		expect(result).toEqual(mockOperations);

		expect(mockRepository.findByOrgId).toHaveBeenCalledWith(
			orgId,
			undefined,
			undefined,
		);
	});
});
