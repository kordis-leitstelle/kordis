import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { lastValueFrom, of, toArray } from 'rxjs';

import { NewTetraStatusEvent } from '@kordis/api/tetra';

import { UpdateUnitStatusCommand } from '../core/command/update-unit-status.command';
import { UnitNotFoundException } from '../core/exception/unit-not-found.exception';
import { GetUnitByRCSIDQuery } from '../core/query/get-unit-by-rcs-id.query';
import { StatusSaga } from './status.saga';

describe('StatusSaga', () => {
	let saga: StatusSaga;
	let queryBus: DeepMocked<QueryBus>;
	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [StatusSaga],
		})
			.overrideProvider(QueryBus)
			.useValue(createMock<QueryBus>())
			.compile();

		saga = moduleRef.get(StatusSaga);
		queryBus = moduleRef.get(QueryBus);
	});

	describe('tetraStatusReceived', () => {
		it('should return commands in order by each group', async () => {
			// we want to test that the saga processes the events in order, but still allows for parallel processing of different units
			// thus, we will simulate the query bus returning the unit with a delay, to ensure the saga processes the events in order
			const dateOfEvent = new Date('2024-02-05T23:13:56.825Z');
			const grp1Res = [
				{ id: 'unit1', ttw: 100 },
				{ id: 'unit1', ttw: 1 },
				{ id: 'unit1', ttw: 5 },
			];
			const grp2Res = [
				{ id: 'unit2', ttw: 50 },
				{ id: 'unit2', ttw: 10 },
			];
			const grp3Res = [{ id: 'unit1', ttw: 1 }];

			queryBus.execute.mockImplementation(async (query) => {
				const unitQuery = query as GetUnitByRCSIDQuery;

				if (unitQuery.orgId === 'org1' && unitQuery.rcsId === 'issi1') {
					const res = grp1Res.shift();
					await new Promise((resolve) => setTimeout(resolve, res!.ttw));
					return { id: res!.id };
				} else if (unitQuery.orgId === 'org1' && unitQuery.rcsId === 'issi2') {
					const res = grp2Res.shift();
					await new Promise((resolve) => setTimeout(resolve, res!.ttw));
					return { id: res!.id };
				} else if (unitQuery.orgId === 'org2' && unitQuery.rcsId === 'issi1') {
					const res = grp3Res.shift();
					await new Promise((resolve) => setTimeout(resolve, res!.ttw));
					return { id: res!.id };
				} else {
					throw new Error('Unknown transactional group detected');
				}
			});

			const events = [
				new NewTetraStatusEvent(
					'org1',
					'issi1',
					1,
					dateOfEvent,
					'TetraControl',
				), // group 1
				new NewTetraStatusEvent(
					'org1',
					'issi1',
					2,
					dateOfEvent,
					'TetraControl',
				), // group 1
				new NewTetraStatusEvent(
					'org1',
					'issi2',
					3,
					dateOfEvent,
					'TetraControl',
				), // group 2
				new NewTetraStatusEvent(
					'org1',
					'issi1',
					3,
					dateOfEvent,
					'TetraControl',
				), // group 1
				new NewTetraStatusEvent(
					'org1',
					'issi2',
					4,
					dateOfEvent,
					'TetraControl',
				), // group 2
				new NewTetraStatusEvent(
					'org2',
					'issi1',
					4,
					dateOfEvent,
					'TetraControl',
				), // group 3
			];
			const events$ = of(...events);

			const expectedCommands = [
				new UpdateUnitStatusCommand(
					'org2',
					'unit1',
					4,
					dateOfEvent,
					'TetraControl',
				), // group 3, first event
				new UpdateUnitStatusCommand(
					'org1',
					'unit2',
					3,
					dateOfEvent,
					'TetraControl',
				), // group 2, first event
				new UpdateUnitStatusCommand(
					'org1',
					'unit2',
					4,
					dateOfEvent,
					'TetraControl',
				), // group 2, second event
				new UpdateUnitStatusCommand(
					'org1',
					'unit1',
					1,
					dateOfEvent,
					'TetraControl',
				), // group 1, first event
				new UpdateUnitStatusCommand(
					'org1',
					'unit1',
					2,
					dateOfEvent,
					'TetraControl',
				), // group 1, second event
				new UpdateUnitStatusCommand(
					'org1',
					'unit1',
					3,
					dateOfEvent,
					'TetraControl',
				), // group 1, third event
			];

			await expect(
				lastValueFrom(saga.tetraStatusReceived(events$).pipe(toArray())),
			).resolves.toEqual(expectedCommands);
		});

		it('should not create command if unit is not found', async () => {
			queryBus.execute.mockRejectedValue(new UnitNotFoundException());

			const events$ = of(
				new NewTetraStatusEvent('org1', 'issi1', 1, new Date(), 'TetraControl'),
			);

			await expect(
				lastValueFrom(saga.tetraStatusReceived(events$).pipe(toArray())),
			).resolves.toHaveLength(0);
		});

		it('should filter status that are not storable', async () => {
			queryBus.execute.mockResolvedValue({ id: 'unit1' });

			const events$ = of(
				new NewTetraStatusEvent('org1', 'issi1', 0, new Date(), 'TetraControl'),
				new NewTetraStatusEvent('org1', 'issi1', 5, new Date(), 'TetraControl'),
				new NewTetraStatusEvent(
					'org1',
					'issi1',
					10,
					new Date(),
					'TetraControl',
				),
			);

			await expect(
				lastValueFrom(saga.tetraStatusReceived(events$).pipe(toArray())),
			).resolves.toHaveLength(0);
		});
	});
});
