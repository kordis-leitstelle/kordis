import { of } from 'rxjs';

import { observableToAsyncIterable } from './observable-to-asynciterable.helper';

describe('observableToAsyncIterable', () => {
	it('should finalize iterator when complete() is called on observer', () => {
		const iterator = observableToAsyncIterable({
			subscribe: (observer) => {
				observer.complete();
				return { unsubscribe: () => {} };
			},
		});

		return iterator.next().then((result) => expect(result.done).toEqual(true));
	});

	it('should iterate over stream', async () => {
		const observable = {
			subscribe: (observer: any) => {
				observer.next(1);
				observer.next(2);
				observer.next(3);
				observer.complete();
				return { unsubscribe: () => {} };
			},
		};
		const asyncIterable = observableToAsyncIterable(observable);

		const values = [];
		for await (const value of asyncIterable) {
			values.push(value);
		}

		expect(values).toEqual([1, 2, 3]);
	});

	it('should work with rxjs observables', async () => {
		// integration test for rxjs, as this is the main library we use for observables
		const observable = of(1, 2, 3);

		const iterator = observableToAsyncIterable(observable);

		const values = [];
		for await (const item of iterator) {
			values.push(item);
		}

		expect(values).toEqual([1, 2, 3]);
	});

	it('should reject on stream error', async () => {
		const observable = {
			subscribe: (observer: any) => {
				observer.error(new Error('test error'));
				return { unsubscribe: () => {} };
			},
		};

		const iterator = observableToAsyncIterable(observable);

		await expect(iterator.next()).rejects.toThrow('test error');
		await expect(iterator.next()).resolves.toEqual({ done: true });
	});
});
