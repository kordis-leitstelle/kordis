import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import DataLoader from 'dataloader';

import { DataLoaderContainer } from '@kordis/api/shared';
import { GetUnitsByIdsQuery } from '@kordis/api/unit';

import { UNITS_DATA_LOADER, UnitsDataLoader } from './units.data-loader';

describe('UnitsDataLoader', () => {
	let dataLoaderContainer: DataLoaderContainer;
	let queryBusMock: DeepMocked<QueryBus>;

	beforeEach(() => {
		dataLoaderContainer = new DataLoaderContainer();
		queryBusMock = createMock<QueryBus>();
		new UnitsDataLoader(dataLoaderContainer, queryBusMock);

		jest.spyOn(dataLoaderContainer, 'registerLoadingFunction');
		jest.spyOn(queryBusMock, 'execute');
	});

	it('should be registered in container', async () => {
		const loader = dataLoaderContainer.getFactory(UNITS_DATA_LOADER)();

		expect(loader).toBeInstanceOf(DataLoader);
	});

	it('should load unit ids', async () => {
		const unitIds = ['id1', 'id2'];
		const loader = dataLoaderContainer.getFactory(UNITS_DATA_LOADER)();
		await loader.loadMany(unitIds);

		expect(queryBusMock.execute).toHaveBeenCalledWith(
			new GetUnitsByIdsQuery(unitIds),
		);
	});
});
