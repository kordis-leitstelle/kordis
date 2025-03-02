import { createMock } from '@golevelup/ts-jest';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationEntity } from '../entity/operation.entity';
import { OperationArchivedEvent } from '../event';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import {
	ArchiveOperationCommand,
	ArchiveOperationHandler,
} from './archive-operation.command';

describe('ArchiveOperationHandler', () => {
	let handler: ArchiveOperationHandler;
	let mockRepository: jest.Mocked<OperationRepository>;
	let eventBus: EventBus;

	beforeEach(async () => {
		mockRepository = createMock<OperationRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				ArchiveOperationHandler,
				{ provide: OPERATION_REPOSITORY, useValue: mockRepository },
			],
			imports: [CqrsModule],
		}).compile();

		handler = moduleRef.get<ArchiveOperationHandler>(ArchiveOperationHandler);
		eventBus = moduleRef.get(EventBus);
	});

	it('should archive operation', async () => {
		const command = new ArchiveOperationCommand('org1', 'op1');
		const operation = new OperationEntity();
		(operation as any).id = 'op1';
		operation.validOrThrow = jest.fn();
		operation.processState = OperationProcessState.COMPLETED;

		mockRepository.findById.mockResolvedValue(operation);

		await new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toBeInstanceOf(OperationArchivedEvent);
				expect(event).toEqual({
					orgId: 'org1',
					operationId: 'op1',
				});
				done();
			});

			return handler.execute(command);
		});

		expect(mockRepository.update).toHaveBeenCalledWith('org1', 'op1', {
			processState: OperationProcessState.ARCHIVED,
		});
	});

	it('should not archive operation', async () => {
		const command = new ArchiveOperationCommand('org1', 'op1');
		const operation = new OperationEntity();
		operation.validOrThrow = jest
			.fn()
			.mockRejectedValueOnce(new Error('error'));
		mockRepository.findById.mockResolvedValue(operation);

		await expect(handler.execute(command)).rejects.toThrow('error');
	});
});
