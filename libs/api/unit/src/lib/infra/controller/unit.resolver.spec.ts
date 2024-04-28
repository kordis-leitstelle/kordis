import { createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import {
	GraphQLSubscriptionService,
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';
import { expectIterableNotToHaveNext } from '@kordis/api/test-helpers';
import { AuthUser } from '@kordis/shared/model';

import { UpdateUnitNoteCommand } from '../../core/command/update-unit-note.command';
import { UpdateUnitStatusCommand } from '../../core/command/update-unit-status.command';
import { UnitEntity } from '../../core/entity/unit.entity';
import { UnitStatusUpdatedEvent } from '../../core/event/unit-status-updated.event';
import { UnitStatusOutdatedException } from '../../core/exception/unit-status-outdated.exception';
import { PresentableUnitStatusOutdatedException } from '../exceptions/presentable-unit-status-outdated.exception';
import { UnitResolver } from './unit.resolver';

describe('UnitResolver', () => {
	let unitResolver: UnitResolver;
	let mockCommandBus: jest.Mocked<CommandBus>;
	let mockQueryBus: jest.Mocked<QueryBus>;
	let eventBus: EventBus;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [UnitResolver, GraphQLSubscriptionService],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.overrideProvider(QueryBus)
			.useValue(createMock<QueryBus>())
			.compile();

		unitResolver = moduleRef.get<UnitResolver>(UnitResolver);
		mockCommandBus = moduleRef.get<jest.Mocked<CommandBus>>(CommandBus);
		mockQueryBus = moduleRef.get<jest.Mocked<QueryBus>>(QueryBus);
		eventBus = moduleRef.get<EventBus>(EventBus);
	});

	it('should return units by organization id', async () => {
		const unit1 = new UnitEntity();
		unit1.name = 'unit1';
		const unit2 = new UnitEntity();
		unit2.name = 'unit2';
		const mockUnits = [unit1, unit2];

		mockQueryBus.execute.mockResolvedValue(mockUnits);

		const result = await unitResolver.units({
			organizationId: 'orgId',
		} as AuthUser);

		expect(result).toEqual(mockUnits);
	});

	it('should return unit by organization id and id', async () => {
		const mockUnit = new UnitEntity();
		mockUnit.name = 'unit';

		mockQueryBus.execute.mockResolvedValue(mockUnit);

		const result = await unitResolver.unit('id', {
			organizationId: 'orgId',
		} as AuthUser);

		expect(result).toEqual(mockUnit);
	});

	it('should update unit note', async () => {
		const mockUnit = new UnitEntity();
		mockUnit.name = 'unit';

		mockQueryBus.execute.mockResolvedValue(mockUnit);

		const result = await unitResolver.updateUnitNote(
			{ organizationId: 'orgId' } as AuthUser,
			'id',
			'note',
		);

		expect(result).toEqual(mockUnit);
		expect(mockCommandBus.execute).toHaveBeenCalledWith(
			new UpdateUnitNoteCommand('orgId', 'id', 'note'),
		);
	});

	describe('updateUnitStatus', () => {
		it('should update unit status', async () => {
			const mockUnit = new UnitEntity();
			mockUnit.name = 'unit';

			mockQueryBus.execute.mockResolvedValue(mockUnit);

			const result = await unitResolver.updateUnitStatus(
				{
					organizationId: 'orgId',
					firstName: 'First',
					lastName: 'Last',
				} as AuthUser,
				'id',
				1,
			);

			expect(result).toEqual(mockUnit);
			expect(mockCommandBus.execute).toHaveBeenCalledWith(
				new UpdateUnitStatusCommand(
					'orgId',
					'id',
					1,
					expect.any(Date),
					'First Last',
				),
			);
		});

		it('should throw PresentableValidationException when ValidationException is thrown', async () => {
			mockCommandBus.execute.mockRejectedValueOnce(new ValidationException([]));

			await expect(
				unitResolver.updateUnitStatus(
					{
						organizationId: 'orgId',
						firstName: 'First',
						lastName: 'Last',
					} as AuthUser,
					'id',
					1,
				),
			).rejects.toThrow(PresentableValidationException);
		});

		it('should throw PresentableUnitStatusOutdatedException when UnitStatusOutdatedException is thrown', async () => {
			mockCommandBus.execute.mockRejectedValueOnce(
				new UnitStatusOutdatedException(),
			);

			await expect(
				unitResolver.updateUnitStatus(
					{
						organizationId: 'orgId',
						firstName: 'First',
						lastName: 'Last',
					} as AuthUser,
					'id',
					1,
				),
			).rejects.toThrow(PresentableUnitStatusOutdatedException);
		});

		it('should throw error when an unknown error is thrown', async () => {
			const error = new Error('Unknown error');
			mockCommandBus.execute.mockRejectedValueOnce(error);

			await expect(
				unitResolver.updateUnitStatus(
					{
						organizationId: 'orgId',
						firstName: 'First',
						lastName: 'Last',
					} as AuthUser,
					'id',
					1,
				),
			).rejects.toThrow(error);
		});
	});

	describe('unitStatusUpdated', () => {
		it('should emit if UnitStatusUpdatedEvent fired', async () => {
			const mockUnit = new UnitEntity();
			mockUnit.name = 'unit';

			mockQueryBus.execute.mockResolvedValue(mockUnit);

			const subscriptionIterable = unitResolver.unitStatusUpdated({
				id: 'userid',
				organizationId: 'orgId',
			} as AuthUser);

			eventBus.publish(
				new UnitStatusUpdatedEvent('orgId', 'unitId', {
					status: 1,
					receivedAt: new Date(),
					source: 'someSource',
				}),
			);

			await expect(subscriptionIterable.next()).resolves.toEqual(
				expect.objectContaining({
					value: {
						unitStatusUpdated: mockUnit,
					},
				}),
			);
		});

		it('should not emi if UnitStatusUpdatedEvent fired for different org', async () => {
			const subscriptionIterable = unitResolver.unitStatusUpdated({
				id: 'userid',
				organizationId: 'someOtherOrgId',
			} as AuthUser);
			eventBus.publish(
				new UnitStatusUpdatedEvent('orgId', 'unitId', {
					status: 1,
					receivedAt: new Date(),
					source: 'someSource',
				}),
			);

			await expectIterableNotToHaveNext(subscriptionIterable);
		});
	});
});
