import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { lastValueFrom, of, toArray } from 'rxjs';

import { StartPendingUnitInvolvementCommand } from '@kordis/api/operation';
import { GetOperationIdOfPendingUnitQuery } from '@kordis/api/operation';
import { UnitStatusUpdatedEvent } from '@kordis/api/unit';

import { MarkUnitAsInvolvedSaga } from './mark-unit-as-involved.saga';

describe('MarkUnitAsInvolvedSaga', () => {
	let saga: MarkUnitAsInvolvedSaga;
	let queryBus: DeepMocked<QueryBus>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [MarkUnitAsInvolvedSaga],
		})
			.overrideProvider(QueryBus)
			.useValue(createMock<QueryBus>())
			.compile();

		saga = moduleRef.get(MarkUnitAsInvolvedSaga);
		queryBus = moduleRef.get(QueryBus);
	});

	describe('operationStatusReceived', () => {
		it('should return commands in order by each group', async () => {
			const dateOfEvent = new Date('2024-02-05T23:13:56.825Z');
			const events = [
				new UnitStatusUpdatedEvent('org1', 'unit1', {
					status: 3,
					receivedAt: dateOfEvent,
					source: 'Tetra Control',
				}),
				new UnitStatusUpdatedEvent('org1', 'unit2', {
					status: 4,
					receivedAt: dateOfEvent,
					source: 'Tetra Control',
				}),
			];
			const events$ = of(...events);

			queryBus.execute.mockResolvedValue('operationId');

			const expectedCommands = [
				new StartPendingUnitInvolvementCommand(
					'org1',
					'unit1',
					'operationId',
					dateOfEvent,
				),
				new StartPendingUnitInvolvementCommand(
					'org1',
					'unit2',
					'operationId',
					dateOfEvent,
				),
			];

			await expect(
				lastValueFrom(saga.operationStatusReceived(events$).pipe(toArray())),
			).resolves.toEqual(expectedCommands);
		});

		it('should not create command if operationId is not found', async () => {
			queryBus.execute.mockResolvedValue(null);

			const events$ = of(
				new UnitStatusUpdatedEvent('org1', 'unit1', {
					status: 3,
					receivedAt: new Date(),
					source: 'Tetra Control',
				}),
			);

			await expect(
				lastValueFrom(saga.operationStatusReceived(events$).pipe(toArray())),
			).resolves.toHaveLength(0);
		});

		it('should filter status that are not storable', async () => {
			queryBus.execute.mockResolvedValue('operationId');

			const events$ = of(
				new UnitStatusUpdatedEvent('org1', 'unit1', {
					status: 1,
					receivedAt: new Date(),
					source: 'Tetra Control',
				}),
				new UnitStatusUpdatedEvent('org1', 'unit1', {
					status: 2,
					receivedAt: new Date(),
					source: 'Tetra Control',
				}),
			);

			await expect(
				lastValueFrom(saga.operationStatusReceived(events$).pipe(toArray())),
			).resolves.toHaveLength(0);
		});
	});

	it('should handle events from the same unit and org id sequentially', async () => {
		const dateOfEvent = new Date('2024-02-05T23:13:56.825Z');
		const events = [
			new UnitStatusUpdatedEvent('org1', 'unit1', {
				status: 3,
				receivedAt: dateOfEvent,
				source: 'Tetra Control',
			}),
			new UnitStatusUpdatedEvent('org1', 'unit1', {
				status: 4,
				receivedAt: dateOfEvent,
				source: 'Tetra Control',
			}),
		];
		const events$ = of(...events);

		queryBus.execute.mockImplementation(async (query) => {
			const unitQuery = query as GetOperationIdOfPendingUnitQuery;
			if (unitQuery.orgId === 'org1' && unitQuery.unitId === 'unit1') {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return 'operationId';
			} else {
				throw new Error('Unknown unit detected');
			}
		});

		const expectedCommands = [
			new StartPendingUnitInvolvementCommand(
				'org1',
				'unit1',
				'operationId',
				dateOfEvent,
			),
			new StartPendingUnitInvolvementCommand(
				'org1',
				'unit1',
				'operationId',
				dateOfEvent,
			),
		];

		await expect(
			lastValueFrom(saga.operationStatusReceived(events$).pipe(toArray())),
		).resolves.toEqual(expectedCommands);
	});
});
