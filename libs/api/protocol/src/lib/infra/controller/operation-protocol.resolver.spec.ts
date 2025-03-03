import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { OperationViewModel } from '@kordis/api/operation';

import { ProtocolEntryBase } from '../../core/entity/protocol-entries/protocol-entry-base.entity';
import { GetByUnitInvolvementsQuery } from '../../core/query/get-by-unit-times.query';
import { OperationProtocolResolver } from './operation-protocol.resolver';

describe('OperationProtocolResolver', () => {
	let resolver: OperationProtocolResolver;
	let queryBus: QueryBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [OperationProtocolResolver, QueryBus],
		}).compile();

		resolver = module.get<OperationProtocolResolver>(OperationProtocolResolver);
		queryBus = module.get<QueryBus>(QueryBus);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});

	describe('protocol', () => {
		it('should return protocol entries for given operation', async () => {
			const operation = {
				orgId: 'orgId',
				unitInvolvements: [
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
				alertGroupInvolvements: [
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
			} as OperationViewModel;

			const expectedResult = [
				{
					id: 'entry1',
				} as ProtocolEntryBase,
				{
					id: 'entry2',
				} as ProtocolEntryBase,
			];
			jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

			await expect(resolver.protocol(operation)).resolves.toEqual(
				expectedResult,
			);
			expect(queryBus.execute).toHaveBeenCalledWith(
				new GetByUnitInvolvementsQuery(
					'orgId',
					operation.unitInvolvements,
					operation.alertGroupInvolvements,
				),
			);
		});
	});
});
