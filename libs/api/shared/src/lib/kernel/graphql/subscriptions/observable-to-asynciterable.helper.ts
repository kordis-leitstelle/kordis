/* eslint-disable @typescript-eslint/no-non-null-assertion */

export interface Observer<T> {
	next: (value: T) => void;
	error: (error: Error) => void;
	complete: () => void;
}

export interface Observable<T> {
	subscribe(observer: Observer<T>): {
		unsubscribe: () => void;
	};
}

export function observableToAsyncIterable<T>(
	observable: Observable<T>,
): AsyncIterableIterator<T> {
	const callbackQueue: {
		resolve: (value: IteratorResult<T>) => void;
		reject: (reason?: unknown) => void;
	}[] = [];
	const resultQueue: (IteratorResult<T> | Error)[] = [];

	let listening = true;

	const pushValue = (value: T): void => {
		if (callbackQueue.length > 0) {
			callbackQueue.shift()!.resolve({ value, done: false });
		} else {
			resultQueue.push({ value, done: false });
		}
	};

	const pushDone = (): void => {
		if (callbackQueue.length > 0) {
			callbackQueue.shift()!.resolve({ value: undefined, done: true });
		} else {
			resultQueue.push({ value: undefined, done: true });
		}
	};

	const pullValue = (): Promise<IteratorResult<T>> =>
		new Promise((resolve, reject) => {
			if (resultQueue.length > 0) {
				const element = resultQueue.shift()!;
				if (element instanceof Error) {
					emptyQueue();
					reject(element);
				} else {
					resolve(element);
				}
			} else {
				callbackQueue.push({ resolve, reject });
			}
		});

	const pushError = (error: Error): void => {
		if (callbackQueue.length > 0) {
			callbackQueue.shift()!.reject(error);
		} else {
			resultQueue.push(error);
		}
	};

	const subscription = observable.subscribe({
		next(value: T) {
			pushValue(value);
		},
		error(err: Error) {
			pushError(err);
		},
		complete() {
			pushDone();
		},
	});

	const emptyQueue = (): void => {
		if (listening) {
			listening = false;
			subscription.unsubscribe();
			for (const callbacks of callbackQueue) {
				callbacks.resolve({ value: undefined, done: true });
			}
			callbackQueue.length = 0;
			resultQueue.length = 0;
		}
	};

	return {
		next() {
			return listening ? pullValue() : this.return!();
		},
		return() {
			emptyQueue();
			return Promise.resolve({ value: undefined, done: true });
		},
		throw(error) {
			emptyQueue();
			return Promise.reject(error);
		},
		[Symbol.asyncIterator]() {
			return this;
		},
	};
}
