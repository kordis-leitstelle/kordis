import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationNotOngoingException } from '../exceptions/operation-not-ongoing.exception';
import { GetOperationByIdQuery } from '../query/get-operation-by-id.query';
import {
	EndOngoingOperationCommand,
	EndOngoingOperationHandler,
} from './end-ongoing-operation.command';
import { UpdateOperationBaseDataCommand } from './update-operation-base-data.command';

describe('EndOngoingOperationHandler', () => {
	let handler: EndOngoingOperationHandler;
	let mockQueryBus: DeepMocked<QueryBus>;
	let mockCommandBus: DeepMocked<CommandBus>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [EndOngoingOperationHandler],
		})
			.overrideProvider(QueryBus)
			.useValue(createMock())
			.overrideProvider(CommandBus)
			.useValue(createMock())
			.compile();

		handler = module.get<EndOngoingOperationHandler>(
			EndOngoingOperationHandler,
		);
		mockQueryBus = module.get(QueryBus);
		mockCommandBus = module.get(CommandBus);
	});

	it('should end an ongoing operation and update its state to COMPLETED', async () => {
		const orgId = 'org1';
		const operationId = 'op1';
		const end = new Date('2024-01-01T00:05:00Z');
		const command = new EndOngoingOperationCommand(orgId, operationId, end);

		const operation = {
			id: operationId,
			orgId,
			processState: OperationProcessState.ON_GOING,
		};

		mockQueryBus.execute.mockResolvedValue(operation);
		mockCommandBus.execute.mockResolvedValue(undefined);

		await handler.execute(command);

		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetOperationByIdQuery(orgId, operationId),
		);
		expect(mockCommandBus.execute).toHaveBeenCalledWith(
			new UpdateOperationBaseDataCommand(orgId, operationId, {
				end,
				processState: OperationProcessState.COMPLETED,
			}),
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
		};

		mockQueryBus.execute.mockResolvedValue(operation);

		await expect(handler.execute(command)).rejects.toThrow(
			OperationNotOngoingException,
		);
	});
});
