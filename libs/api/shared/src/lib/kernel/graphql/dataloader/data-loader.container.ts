import { Injectable } from '@nestjs/common';
import DataLoader, { BatchLoadFn } from 'dataloader';

type DataLoaderFactory<TInput = unknown, TReturn = unknown> = () => DataLoader<
	TInput,
	TReturn
>;

export class DataLoaderNotRegisteredError extends Error {
	constructor(loaderToken: symbol) {
		super(
			`No loader factory found for ${loaderToken.toString()}, might not registered yet.`,
		);
	}
}

/*
 * Container for registering and retrieving DataLoader factories. This gets injected into the DataLoaderContextProvider, which is constructed for every request and available in the requests context.
 */
@Injectable()
export class DataLoaderContainer {
	private readonly loaderFactories = new Map<symbol, DataLoaderFactory>();

	registerLoadingFunction<TInput, TReturn>(
		loaderToken: symbol,
		batchLoadingFunction: BatchLoadFn<TInput, TReturn>,
	): void {
		const factory = (): DataLoader<TInput, TReturn> =>
			new DataLoader(batchLoadingFunction);
		this.loaderFactories.set(loaderToken, factory);
	}

	getFactory<TInput, TReturn>(
		loaderToken: symbol,
	): DataLoaderFactory<TInput, TReturn> {
		const factory = this.loaderFactories.get(loaderToken);
		if (!factory) {
			throw new DataLoaderNotRegisteredError(loaderToken);
		}
		return factory as DataLoaderFactory<TInput, TReturn>;
	}
}
