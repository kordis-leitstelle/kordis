import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';

import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationEntity } from '../entity/operation.entity';
import { OperationEndedEvent } from '../event/operation-ended.event';
import { OperationNotOngoingException } from '../exceptions/operation-not-ongoing.exception';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';
import {
	EndOngoingOperationCommand,
	EndOngoingOperationHandler,
} from './end-ongoing-operation.command';

describe('EndOngoingOperationHandler', () => {
	let handler: EndOngoingOperationHandler;
	let mockRepository: DeepMocked<OperationRepository>;
	let mockInvolvementService: DeepMocked<OperationInvolvementService>;
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [
				EndOngoingOperationHandler,
				{
					provide: OPERATION_REPOSITORY,
					useValue: createMock(),
				},
				{
					provide: OperationInvolvementService,
					useValue: createMock(),
				},
				uowMockProvider(),
			],
		}).compile();

		handler = module.get<EndOngoingOperationHandler>(
			EndOngoingOperationHandler,
		);
		mockRepository = module.get(OPERATION_REPOSITORY);
		mockInvolvementService = module.get(OperationInvolvementService);
		eventBus = module.get(EventBus);
	});

	it('should update its state to COMPLETED and end involvements', async () => {
		const orgId = 'org1';
		const operationId = 'op1';
		const end = new Date('2024-01-01T00:05:00Z');
		const command = new EndOngoingOperationCommand(orgId, operationId, end);

		const operation = {
			id: operationId,
			orgId,
			processState: OperationProcessState.ON_GOING,
		} as OperationEntity;

		mockRepository.findById.mockResolvedValue(operation);
		await handler.execute(command);

		expect(mockRepository.update).toHaveBeenCalledWith(
			orgId,
			operationId,
			{
				end,
				processState: OperationProcessState.COMPLETED,
			},
			expect.anything(),
		);

		expect(mockInvolvementService.endInvolvements).toHaveBeenCalledWith(
			orgId,
			operationId,
			end,
			expect.anything(),
		);
	});

	it('should throw OperationNotOngoingException if the operation is not ongoing', async () => {
		const orgId = 'org1';
		const operationId = 'op1';
		const end = new Date('2024-01-01T00:05:00Z');
		const command = new EndOngoingOperationCommand(orgId, operationId, end);

		const operation = {
			id: operationId,
			orgId,
			processState: OperationProcessState.COMPLETED,
		} as OperationEntity;

		mockRepository.findById.mockResolvedValue(operation);

		await expect(handler.execute(command)).rejects.toThrow(
			OperationNotOngoingException,
		);
	});

	it('should publish OperationEndedEvent', async () => {
		const orgId = 'org1';
		const operationId = 'op1';
		const end = new Date('2024-01-01T00:05:00Z');
		const command = new EndOngoingOperationCommand(orgId, operationId, end);

		const operation = {
			id: operationId,
			orgId,
			processState: OperationProcessState.ON_GOING,
		} as OperationEntity;

		mockRepository.findById.mockResolvedValue(operation);
		jest.spyOn(eventBus, 'publish');

		await handler.execute(command);

		expect(eventBus.publish).toHaveBeenCalledWith(
			new OperationEndedEvent(orgId, operationId),
		);
	});
});
