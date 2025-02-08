import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../repository/operation-involvement.repository';
import {
	GetOperationIdOfPendingUnitHandler,
	GetOperationIdOfPendingUnitQuery,
} from './get-operation-id-of-pending-unit.query';

describe('GetOperationIdOfPendingUnitHandler', () => {
	let handler: GetOperationIdOfPendingUnitHandler;
	let mockRepository: jest.Mocked<OperationInvolvementsRepository>;

	beforeEach(async () => {
		mockRepository = createMock<OperationInvolvementsRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				GetOperationIdOfPendingUnitHandler,
				{
					provide: OPERATION_INVOLVEMENT_REPOSITORY,
					useValue: mockRepository,
				},
			],
		}).compile();

		handler = moduleRef.get<GetOperationIdOfPendingUnitHandler>(
			GetOperationIdOfPendingUnitHandler,
		);
	});

	it('should get operation id of pending unit', async () => {
		const orgId = 'org1';
		const unitId = 'unit1';
		const query = new GetOperationIdOfPendingUnitQuery(orgId, unitId);

		const operationId = 'operation1';
		mockRepository.findInvolvementOfPendingUnit.mockResolvedValue({
			unitId,
			operationId,
			involvementTimes: [],
			alertGroupId: null,
			isPending: true,
		});

		const result = await handler.execute(query);
		expect(result).toBe(operationId);

		expect(mockRepository.findInvolvementOfPendingUnit).toHaveBeenCalledWith(
			orgId,
			unitId,
		);
	});
});
