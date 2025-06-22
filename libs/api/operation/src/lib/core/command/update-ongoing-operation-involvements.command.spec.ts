import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { DbSessionProvider, UNIT_OF_WORK_SERVICE } from '@kordis/api/shared';

import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../repository/operation-involvement.repository';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';
import {
	UpdateOngoingOperationInvolvementsCommand,
	UpdateOngoingOperationInvolvementsHandler,
} from './update-ongoing-operation-involvements.command';

jest.mock('../service/updated-involvements.manager');

describe('UpdateOngoingOperationInvolvementsHandler', () => {
	let handler: UpdateOngoingOperationInvolvementsHandler;
	let mockInvolvementService: jest.Mocked<OperationInvolvementService>;
	let mockInvolvementsRepository: DeepMocked<OperationInvolvementsRepository>;
	let mockUowService: any;

	beforeEach(async () => {
		mockInvolvementService = createMock<OperationInvolvementService>();
		mockInvolvementsRepository = createMock<OperationInvolvementsRepository>();
		mockUowService = createMock<DbSessionProvider>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				UpdateOngoingOperationInvolvementsHandler,
				{
					provide: OperationInvolvementService,
					useValue: mockInvolvementService,
				},
				{
					provide: OPERATION_INVOLVEMENT_REPOSITORY,
					useValue: mockInvolvementsRepository,
				},
				{
					provide: UNIT_OF_WORK_SERVICE,
					useValue: mockUowService,
				},
			],
			imports: [CqrsModule],
		}).compile();

		handler = moduleRef.get<UpdateOngoingOperationInvolvementsHandler>(
			UpdateOngoingOperationInvolvementsHandler,
		);

		jest.clearAllMocks();
	});

	it('should execute within a transaction', async () => {
		// Arrange
		const command = new UpdateOngoingOperationInvolvementsCommand(
			'org1',
			'op1',
			['unit1'],
			[],
		);

		await handler.execute(command);

		expect(mockUowService.asTransaction).toHaveBeenCalled();
	});
});
