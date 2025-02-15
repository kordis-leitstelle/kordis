import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';

import {
	UpdateOperationAlertGroupInvolvementInput,
	UpdateOperationUnitInvolvementInput,
} from '../../infra/controller/args/update-operation-involvement.args';
import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationEntity } from '../entity/operation.entity';
import { OperationInvolvementsUpdatedEvent } from '../event/operation-involvements-updated.event';
import { OperationNotCompletedException } from '../exceptions/operation-not-completed.exception';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';
import {
	UpdateOperationInvolvementsCommand,
	UpdateOperationInvolvementsHandler,
} from './update-operation-involvements.command';

describe('UpdateOperationInvolvementsHandler', () => {
	let handler: UpdateOperationInvolvementsHandler;
	let mockInvolvementService: jest.Mocked<OperationInvolvementService>;
	let eventBus: EventBus;
	let mockOperationRepository: DeepMocked<OperationRepository>;
	beforeEach(async () => {
		mockInvolvementService = createMock<OperationInvolvementService>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				UpdateOperationInvolvementsHandler,
				{
					provide: OperationInvolvementService,
					useValue: mockInvolvementService,
				},
				{
					provide: OPERATION_REPOSITORY,
					useValue: createMock(),
				},
				uowMockProvider(),
			],
			imports: [CqrsModule],
		}).compile();

		handler = moduleRef.get<UpdateOperationInvolvementsHandler>(
			UpdateOperationInvolvementsHandler,
		);
		mockOperationRepository = moduleRef.get(OPERATION_REPOSITORY);
		eventBus = moduleRef.get(EventBus);
	});

	it('should update operation involvements and emit involvements updated event', async () => {
		const command = new UpdateOperationInvolvementsCommand(
			'org1',
			'op1',
			[new UpdateOperationUnitInvolvementInput()],
			[new UpdateOperationAlertGroupInvolvementInput()],
		);
		mockOperationRepository.findById.mockResolvedValue({
			processState: OperationProcessState.COMPLETED,
			id: 'someId',
		} as OperationEntity);

		await new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toBeInstanceOf(OperationInvolvementsUpdatedEvent);
				expect(event).toEqual({
					orgId: 'org1',
					operationId: 'op1',
				});
				done();
			});

			return handler.execute(command);
		});

		expect(mockInvolvementService.setUnitInvolvements).toHaveBeenCalledWith(
			'org1',
			'op1',
			command.unitInvolvements,
			command.alertGroupInvolvements,
			expect.anything(),
		);
	});

	it('should throw error if operation is not completed', async () => {
		const command = new UpdateOperationInvolvementsCommand(
			'org1',
			'op1',
			[new UpdateOperationUnitInvolvementInput()],
			[new UpdateOperationAlertGroupInvolvementInput()],
		);
		mockOperationRepository.findById.mockResolvedValue({
			processState: OperationProcessState.ON_GOING,
			id: 'someId',
		} as OperationEntity);

		await expect(handler.execute(command)).rejects.toThrow(
			OperationNotCompletedException,
		);
	});
});
