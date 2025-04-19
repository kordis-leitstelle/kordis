import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { ProtocolEntryBase } from '../entity/protocol-entries/protocol-entry-base.entity';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../repository/protocol-entry.repository';
import {
	GetByUnitInvolvementsHandler,
	GetByUnitInvolvementsQuery,
} from './get-by-unit-times.query';

describe('GetByUnitInvolvementsHandler', () => {
	let queryHandler: GetByUnitInvolvementsHandler;
	let mockRepo: DeepMocked<ProtocolEntryRepository>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetByUnitInvolvementsHandler,
				{
					provide: PROTOCOL_ENTRY_REPOSITORY,
					useValue: createMock(),
				},
			],
		}).compile();

		queryHandler = module.get<GetByUnitInvolvementsHandler>(
			GetByUnitInvolvementsHandler,
		);
		mockRepo = module.get(PROTOCOL_ENTRY_REPOSITORY);
	});

	it('should return protocol entries for given unit involvements', async () => {
		const query = new GetByUnitInvolvementsQuery(
			'orgId',
			[
				{
					unit: { id: 'unit1' },
					involvementTimes: [
						{
							start: new Date('2023-01-01T00:00:00Z'),
							end: new Date('2023-01-01T01:00:00Z'),
						},
					],
				},
				{
					unit: { id: 'unit2' },
					involvementTimes: [
						{
							start: new Date('2023-01-02T00:00:00Z'),
							end: new Date('2023-01-02T01:00:00Z'),
						},
					],
				},
			],
			[
				{
					unitInvolvements: [
						{
							unit: { id: 'alertGroupUnit1' },
							involvementTimes: [
								{
									start: new Date('2023-01-03T00:00:00Z'),
									end: new Date('2023-01-03T01:00:00Z'),
								},
							],
						},
					],
				},
			],
		);

		const expectedResult = [
			{ id: 'entry1' } as ProtocolEntryBase,
			{ id: 'entry2' } as ProtocolEntryBase,
		];
		mockRepo.getFromUnitTimes.mockResolvedValue(expectedResult);

		const result = await queryHandler.execute(query);
		expect(result).toEqual(expectedResult);
		expect(mockRepo.getFromUnitTimes).toHaveBeenCalledWith('orgId', [
			{
				unitId: 'unit1',
				range: {
					start: new Date('2023-01-01T00:00:00Z'),
					end: new Date('2023-01-01T01:00:00Z'),
				},
			},
			{
				unitId: 'unit2',
				range: {
					start: new Date('2023-01-02T00:00:00Z'),
					end: new Date('2023-01-02T01:00:00Z'),
				},
			},
			{
				unitId: 'alertGroupUnit1',
				range: {
					start: new Date('2023-01-03T00:00:00Z'),
					end: new Date('2023-01-03T01:00:00Z'),
				},
			},
		]);
	});
});
