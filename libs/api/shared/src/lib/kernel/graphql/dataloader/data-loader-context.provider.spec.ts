import { DeepMocked, createMock } from '@golevelup/ts-jest';
import DataLoader from 'dataloader';

import { DataLoaderContextProvider } from './data-loader-context.provider';
import { DataLoaderContainer } from './data-loader.container';

describe('DataLoaderContextProvider', () => {
	let dataLoaderContextProvider: DataLoaderContextProvider;
	let dataLoaderContainer: DeepMocked<DataLoaderContainer>;

	beforeEach(async () => {
		dataLoaderContainer = createMock<DataLoaderContainer>();
		dataLoaderContextProvider = new DataLoaderContextProvider(
			dataLoaderContainer,
		);
	});

	it('should retrieve a DataLoader from the DataLoaderContainer and cache it', async () => {
		const loaderToken = Symbol('loaderToken');
		const mockDataLoader = new DataLoader(() => Promise.resolve([]));
		const mockFactory = jest.fn(() => mockDataLoader);

		dataLoaderContainer.getFactory.mockReturnValue(mockFactory);

		const loader1 = dataLoaderContextProvider.getLoader(loaderToken);
		const loader2 = dataLoaderContextProvider.getLoader(loaderToken);

		expect(dataLoaderContainer.getFactory).toHaveBeenCalledWith(loaderToken);
		expect(mockFactory).toHaveBeenCalledTimes(1);
		expect(loader1).toBe(mockDataLoader);
		expect(loader2).toBe(mockDataLoader);
	});
});
