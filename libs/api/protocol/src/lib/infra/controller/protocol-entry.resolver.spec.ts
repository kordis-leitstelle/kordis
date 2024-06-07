import { createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthUser } from '@kordis/shared/model';

import { Page } from '../../core/entity/page.entity';
import { ProtocolEntryBase } from '../../core/entity/protocol-entries/protocol-entry-base.entity';
import { GetProtocolEntriesQuery } from '../../core/query/get-protocol-entries.query';
import { ProtocolEntryResolver } from './protocol-entry.resolver';

describe('ProtocolEntryResolver', () => {
	let resolver: ProtocolEntryResolver;
	const mockQueryBus = createMock<QueryBus>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProtocolEntryResolver,
				{ provide: QueryBus, useValue: mockQueryBus },
			],
		}).compile();

		resolver = module.get<ProtocolEntryResolver>(ProtocolEntryResolver);
	});

	it('should find protocol entries by orgId', async () => {
		const orgId = 'orgId';
		const count = 20;

		mockQueryBus.execute.mockResolvedValueOnce({
			hasNext: true,
			hasPrevious: false,
			nodes: [
				{ time: new Date('1913-10-19') },
				{ time: new Date('1912-07-28') },
			] as ProtocolEntryBase[],
			totalEdges: 100,
		} as Page<ProtocolEntryBase>);

		const result = await resolver.protocolEntries(
			{ organizationId: orgId } as AuthUser,
			{ first: count },
		);

		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetProtocolEntriesQuery(orgId, count, 'desc'),
		);

		expect(result.pageInfo.totalEdges).toBe(100);
		expect(result.pageInfo.hasNextPage).toBe(true);
		expect(result.pageInfo.hasPreviousPage).toBe(false);
		expect(result.edges).toHaveLength(2);
	});
});
