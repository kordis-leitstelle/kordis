import DataLoader from 'dataloader';

import { DataLoaderContainer } from './data-loader.container';

export class DataLoaderContextProvider {
	private readonly loaderCache = new Map<
		symbol,
		DataLoader<unknown, unknown>
	>();

	constructor(private readonly dataLoaderContainer: DataLoaderContainer) {}

	getLoader<TInput = unknown, TReturn = unknown>(
		loaderToken: symbol,
	): DataLoader<TInput, TReturn> {
		let loader: DataLoader<TInput, TReturn>;
		if (!this.loaderCache.has(loaderToken)) {
			const loaderFactory = this.dataLoaderContainer.getFactory<
				TInput,
				TReturn
			>(loaderToken);
			loader = loaderFactory();
			this.loaderCache.set(loaderToken, loader);
		} else {
			loader = this.loaderCache.get(loaderToken) as DataLoader<TInput, TReturn>;
		}
		return loader;
	}
}
