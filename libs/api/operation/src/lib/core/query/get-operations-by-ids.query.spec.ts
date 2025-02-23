import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { RetainOrderService } from '@kordis/api/shared';

import { OperationEntity } from '../entity/operation.entity';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import {
	GetOperationByIdsQueryHandler,
	GetOperationsByIdsQuery,
} from './get-operations-by-ids.query';

describe('GetOperationByIdsQueryHandler', () => {
	let handler: GetOperationByIdsQueryHandler;
	let mockRepository: jest.Mocked<OperationRepository>;
	let mockMutator: jest.Mocked<RetainOrderService>;

	beforeEach(async () => {
		mockRepository = createMock<OperationRepository>();
		mockMutator = createMock<RetainOrderService>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				GetOperationByIdsQueryHandler,
				{ provide: OPERATION_REPOSITORY, useValue: mockRepository },
				{ provide: RetainOrderService, useValue: mockMutator },
			],
		}).compile();

		handler = moduleRef.get(GetOperationByIdsQueryHandler);
	});

	it('should return operations by ids', async () => {
		const ids = ['op1', 'op2'];
		const options = { retainOrder: true };
		const query = new GetOperationsByIdsQuery(ids, options);

		const mockOperations = [new OperationEntity(), new OperationEntity()];
		mockRepository.findByIds.mockResolvedValue(mockOperations);
		mockMutator.retainOrderIfEnabled.mockReturnValue(mockOperations);

		const result = await handler.execute(query);
		expect(result).toBe(mockOperations);
		expect(mockRepository.findByIds).toHaveBeenCalledWith(ids);
		expect(mockMutator.retainOrderIfEnabled).toHaveBeenCalledWith(
			options,
			ids,
			mockOperations,
		);
	});
});
