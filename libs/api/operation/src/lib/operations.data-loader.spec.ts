import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import DataLoader from 'dataloader';

import { DataLoaderContainer } from '@kordis/api/shared';

import { GetOperationsByIdsQuery } from './core/query/get-operations-by-ids.query';
import {
	OPERATION_DATA_LOADER,
	OperationsDataLoader,
} from './operations.data-loader';

describe('OperationsDataLoader', () => {
	let dataLoaderContainer: DataLoaderContainer;
	let queryBusMock: DeepMocked<QueryBus>;

	beforeEach(() => {
		dataLoaderContainer = new DataLoaderContainer();
		queryBusMock = createMock<QueryBus>();
		new OperationsDataLoader(dataLoaderContainer, queryBusMock);

		jest.spyOn(dataLoaderContainer, 'registerLoadingFunction');
		jest.spyOn(queryBusMock, 'execute');
	});

	it('should be registered in container', async () => {
		const loader = dataLoaderContainer.getFactory(OPERATION_DATA_LOADER)();

		expect(loader).toBeInstanceOf(DataLoader);
	});

	it('should load operation ids', async () => {
		const unitIds = ['id1', 'id2'];
		const loader = dataLoaderContainer.getFactory(OPERATION_DATA_LOADER)();
		await loader.loadMany(unitIds);

		expect(queryBusMock.execute).toHaveBeenCalledWith(
			new GetOperationsByIdsQuery(unitIds, { retainOrder: true }),
		);
	});
});
