import { createMock } from '@golevelup/ts-jest';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { InsufficientPermissionException } from '@kordis/api/shared';
import { uowMockProvider } from '@kordis/api/test-helpers';
import { AuthUser, Role } from '@kordis/shared/model';

import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationEntity } from '../entity/operation.entity';
import { OperationDeletedEvent } from '../event/operation-deleted.event';
import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../repository/operation-involvement.repository';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import {
	DeleteOperationCommand,
	DeleteOperationHandler,
} from './delete-operation.command';

describe('DeleteOperationHandler', () => {
	let handler: DeleteOperationHandler;
	let mockRepository: jest.Mocked<OperationRepository>;
	let mockInvolvementRepository: jest.Mocked<OperationInvolvementsRepository>;
	let eventBus: EventBus;

	beforeEach(async () => {
		mockRepository = createMock<OperationRepository>();
		mockInvolvementRepository = createMock<OperationInvolvementsRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				DeleteOperationHandler,
				{ provide: OPERATION_REPOSITORY, useValue: mockRepository },
				{
					provide: OPERATION_INVOLVEMENT_REPOSITORY,
					useValue: mockInvolvementRepository,
				},
				uowMockProvider(),
			],
			imports: [CqrsModule],
		}).compile();

		handler = moduleRef.get<DeleteOperationHandler>(DeleteOperationHandler);
		eventBus = moduleRef.get(EventBus);
	});

	it('should throw error if non-admin user tries to delete archived operation', async () => {
		const command = new DeleteOperationCommand(
			'org1',
			{ id: 'user1', role: Role.USER } as AuthUser,
			'op1',
		);
		const operation = new OperationEntity();
		operation.processState = OperationProcessState.ARCHIVED;

		mockRepository.findById.mockResolvedValue(operation);

		await expect(handler.execute(command)).rejects.toThrow(
			InsufficientPermissionException,
		);
	});

	it('should set `deleted` process state of operation and involvements and emit deletion event', async () => {
		const command = new DeleteOperationCommand(
			'org1',
			{ id: 'admin1', role: Role.USER } as AuthUser,
			'op1',
		);
		const operation = new OperationEntity();
		(operation as any).id = 'op1';
		operation.processState = OperationProcessState.COMPLETED;

		mockRepository.findById.mockResolvedValue(operation);

		await new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toBeInstanceOf(OperationDeletedEvent);
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
			{
				processState: OperationProcessState.DELETED,
			},
			expect.anything(),
		);
		expect(mockInvolvementRepository.setDeletedFlag).toHaveBeenCalledWith(
			'org1',
			'op1',
			true,
			expect.anything(),
		);
	});
});
