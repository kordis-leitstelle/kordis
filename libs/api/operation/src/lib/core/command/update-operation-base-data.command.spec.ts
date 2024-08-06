import { createMock } from '@golevelup/ts-jest';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { OperationBaseDataUpdatedEvent } from '../event/operation-base-data-updated.event';
import { UpdateOperationDto } from '../repository/dto/update-operation.dto';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import {
	UpdateOperationBaseDataCommand,
	UpdateOperationBaseDataHandler,
} from './update-operation-base-data.command';

describe('UpdateOperationBaseDataHandler', () => {
	let handler: UpdateOperationBaseDataHandler;
	let mockRepository: jest.Mocked<OperationRepository>;
	let eventBus: EventBus;

	beforeEach(async () => {
		mockRepository = createMock<OperationRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				UpdateOperationBaseDataHandler,
				{ provide: OPERATION_REPOSITORY, useValue: mockRepository },
			],
			imports: [CqrsModule],
		}).compile();

		handler = moduleRef.get<UpdateOperationBaseDataHandler>(
			UpdateOperationBaseDataHandler,
		);
		eventBus = moduleRef.get(EventBus);
	});

	it('should update operation base data and emit base data updated event', async () => {
		const command = new UpdateOperationBaseDataCommand(
			'org1',
			'op1',
			new UpdateOperationDto(),
		);

		await new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toBeInstanceOf(OperationBaseDataUpdatedEvent);
				expect(event).toEqual({
					orgId: 'org1',
					operationId: 'op1',
				});
				done();
			});

			return handler.execute(command);
		});

		expect(mockRepository.update).toHaveBeenCalledWith(
			'org1',
			'op1',
			command.data,
		);
	});
});
