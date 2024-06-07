import { createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import DataLoader from 'dataloader';

import { DataLoaderContextProvider } from '@kordis/api/shared';
import { UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import { Page } from '../../core/entity/page.entity';
import { RegisteredUnit } from '../../core/entity/partials/unit-partial.entity';
import { ProtocolEntryBase } from '../../core/entity/protocol-entries/protocol-entry-base.entity';
import { GetProtocolEntriesQuery } from '../../core/query/get-protocol-entries.query';
import {
	ProtocolEntryResolver,
	RegisteredUnitResolver,
} from './protocol-entry.resolver';

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

describe('RegisteredUnitResolver', () => {
	let resolver: RegisteredUnitResolver;
	const mockLoadersProvider = createMock<DataLoaderContextProvider>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RegisteredUnitResolver],
		}).compile();

		resolver = module.get<RegisteredUnitResolver>(RegisteredUnitResolver);
	});

	it('Should return units by registered units', async () => {
		const unit = plainToInstance(RegisteredUnit, {
			unit: { id: '66630bb3ad305edf39bc9729' },
		});
		const mockUnit = {} as UnitViewModel;

		const mockDataLoader = createMock<DataLoader<string, UnitViewModel>>();
		mockDataLoader.load.mockResolvedValueOnce(mockUnit);
		mockLoadersProvider.getLoader.mockReturnValueOnce(mockDataLoader);

		const result = await resolver.unit(unit, {
			loadersProvider: mockLoadersProvider,
		});

		expect(result).toBe(mockUnit);
	});
});
