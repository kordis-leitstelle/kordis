import { createMock } from '@golevelup/ts-jest';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';

import { OngoingOperationInvolvementsUpdatedEvent } from '../event/ongoing-operation-involvements-updated.event';
import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../repository/operation-involvement.repository';
import {
	StartPendingUnitInvolvementCommand,
	StartPendingUnitInvolvementHandler,
} from './start-pending-unit-involvement.command';

describe('StartPendingUnitInvolvementHandler', () => {
	let handler: StartPendingUnitInvolvementHandler;
	let mockRepository: jest.Mocked<OperationInvolvementsRepository>;
	let eventBus: EventBus;

	beforeEach(async () => {
		mockRepository = createMock<OperationInvolvementsRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				StartPendingUnitInvolvementHandler,
				{
					provide: OPERATION_INVOLVEMENT_REPOSITORY,
					useValue: mockRepository,
				},
				uowMockProvider(),
			],
			imports: [CqrsModule],
		}).compile();

		handler = moduleRef.get<StartPendingUnitInvolvementHandler>(
			StartPendingUnitInvolvementHandler,
		);
		eventBus = moduleRef.get(EventBus);
	});

	it('should set start of pending unit', async () => {
		const start = new Date();
		const command = new StartPendingUnitInvolvementCommand(
			'org1',
			'unit1',
			'op1',
			start,
		);

		await new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toBeInstanceOf(OngoingOperationInvolvementsUpdatedEvent);
				expect(event).toEqual({
					orgId: 'org1',
					operationId: 'op1',
				});
				done();
			});

			return handler.execute(command);
		});

		expect(mockRepository.addStartOfPendingUnit).toHaveBeenCalledWith(
			'org1',
			'op1',
			'unit1',
			start,
		);
	});
});
