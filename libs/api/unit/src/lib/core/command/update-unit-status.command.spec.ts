import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { ValidationException } from '@kordis/api/shared';

import { UnitStatusUpdatedEvent } from '../event/unit-status-updated.event';
import { UnitStatusOutdatedException } from '../exception/unit-status-outdated.exception';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';
import {
	UpdateUnitStatusCommand,
	UpdateUnitStatusHandler,
} from './update-unit-status.command';

describe('UpdateUnitStatusHandler', () => {
	let handler: UpdateUnitStatusHandler;
	let repository: UnitRepository;
	let eventBus: EventBus;
	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [
				UpdateUnitStatusHandler,
				{
					provide: UNIT_REPOSITORY,
					useValue: {
						updateStatus: jest.fn().mockResolvedValue(true),
					},
				},
			],
		}).compile();

		handler = moduleRef.get<UpdateUnitStatusHandler>(UpdateUnitStatusHandler);
		repository = moduleRef.get<UnitRepository>(UNIT_REPOSITORY);
		eventBus = moduleRef.get<EventBus>(EventBus);
	});

	it('should throw an error when an incorrect status is passed', async () => {
		const command = new UpdateUnitStatusCommand(
			'orgId',
			'unitId',
			-1,
			new Date(),
			'source',
		);
		await expect(handler.execute(command)).rejects.toThrow(ValidationException);
	});

	it('should update status', async () => {
		const command = new UpdateUnitStatusCommand(
			'orgId',
			'unitId',
			1,
			new Date(),
			'source',
		);
		await handler.execute(command);

		expect(repository.updateStatus).toHaveBeenCalledWith(
			'orgId',
			'unitId',
			expect.anything(),
		);
	});

	it('should not update the status if the status is outdated', async () => {
		jest.spyOn(repository, 'updateStatus').mockResolvedValueOnce(false);

		const command = new UpdateUnitStatusCommand(
			'orgId',
			'unitId',
			1,
			new Date(),
			'source',
		);
		await expect(handler.execute(command)).rejects.toThrow(
			UnitStatusOutdatedException,
		);
	});

	it('should emit event on status updated', async () => {
		jest.spyOn(repository, 'updateStatus').mockResolvedValueOnce(true);
		const sentAt = new Date();
		const command = new UpdateUnitStatusCommand(
			'orgId',
			'unitId',
			1,
			sentAt,
			'source',
		);
		return new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toBeInstanceOf(UnitStatusUpdatedEvent);
				expect(event).toEqual({
					orgId: 'orgId',
					unitId: 'unitId',
					status: {
						status: 1,
						receivedAt: sentAt,
						source: 'source',
					},
				});
				done();
			});

			return handler.execute(command);
		});
	});
});
