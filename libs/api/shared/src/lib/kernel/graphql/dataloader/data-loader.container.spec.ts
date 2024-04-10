import { Test } from '@nestjs/testing';
import DataLoader from 'dataloader';

import {
	DataLoaderContainer,
	DataLoaderNotRegisteredError,
} from './data-loader.container';

describe('DataLoaderContainer', () => {
	let dataLoaderContainer: DataLoaderContainer;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [DataLoaderContainer],
		}).compile();

		dataLoaderContainer =
			moduleRef.get<DataLoaderContainer>(DataLoaderContainer);
	});

	it('should register and retrieve a factory for a given loader token', () => {
		const loaderToken = Symbol('loaderToken');
		const mockBatchLoadingFunction = jest.fn();

		dataLoaderContainer.registerLoadingFunction(
			loaderToken,
			mockBatchLoadingFunction,
		);

		const factory = dataLoaderContainer.getFactory(loaderToken);
		const loader = factory();

		expect(loader).toBeInstanceOf(DataLoader);
	});

	it('should throw an error if no factory is registered for a given loader token', () => {
		const loaderToken = Symbol('loaderToken');

		expect(() => dataLoaderContainer.getFactory(loaderToken)).toThrow(
			DataLoaderNotRegisteredError,
		);
	});
});
