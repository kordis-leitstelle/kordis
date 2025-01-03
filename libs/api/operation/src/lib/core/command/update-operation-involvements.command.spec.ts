import { createMock } from '@golevelup/ts-jest';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';

import {
	UpdateOperationAlertGroupInvolvementInput,
	UpdateOperationUnitInvolvementInput,
} from '../../infra/controller/args/update-operation-involvement.args';
import { OperationInvolvementsUpdatedEvent } from '../event/operation-involvements-updated.event';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';
import {
	UpdateOperationInvolvementsCommand,
	UpdateOperationInvolvementsHandler,
} from './update-operation-involvements.command';

describe('UpdateOperationInvolvementsHandler', () => {
	let handler: UpdateOperationInvolvementsHandler;
	let mockInvolvementService: jest.Mocked<OperationInvolvementService>;
	let eventBus: EventBus;

	beforeEach(async () => {
		mockInvolvementService = createMock<OperationInvolvementService>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				UpdateOperationInvolvementsHandler,
				{
					provide: OperationInvolvementService,
					useValue: mockInvolvementService,
				},
				uowMockProvider(),
			],
			imports: [CqrsModule],
		}).compile();

		handler = moduleRef.get<UpdateOperationInvolvementsHandler>(
			UpdateOperationInvolvementsHandler,
		);
		eventBus = moduleRef.get(EventBus);
	});

	it('should update operation involvements and emit involvements updated event', async () => {
		const command = new UpdateOperationInvolvementsCommand(
			'org1',
			'op1',
			[new UpdateOperationUnitInvolvementInput()],
			[new UpdateOperationAlertGroupInvolvementInput()],
		);

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
});
