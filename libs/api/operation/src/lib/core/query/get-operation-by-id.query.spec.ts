import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { OperationEntity } from '../entity/operation.entity';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import {
	GetOperationByIdHandler,
	GetOperationByIdQuery,
} from './get-operation-by-id.query';

describe('GetOperationByIdHandler', () => {
	let handler: GetOperationByIdHandler;
	let mockRepository: jest.Mocked<OperationRepository>;

	beforeEach(async () => {
		mockRepository = createMock<OperationRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				GetOperationByIdHandler,
				{
					provide: OPERATION_REPOSITORY,
					useValue: mockRepository,
				},
			],
		}).compile();

		handler = moduleRef.get<GetOperationByIdHandler>(GetOperationByIdHandler);
	});

	it('should get operation by id', async () => {
		const orgId = 'org1';
		const id = 'id1';
		const query = new GetOperationByIdQuery(orgId, id);

		const mockOperation = new OperationEntity();
		mockRepository.findById.mockResolvedValue(mockOperation);

		const result = await handler.execute(query);
		expect(result).toBe(mockOperation);

		expect(mockRepository.findById).toHaveBeenCalledWith(orgId, id);
	});
});
