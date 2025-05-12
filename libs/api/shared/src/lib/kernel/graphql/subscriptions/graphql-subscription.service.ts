import { Injectable, OnModuleDestroy, Type } from '@nestjs/common';
import { EventBus, IEvent, ofType } from '@nestjs/cqrs';
import {
	Observable,
	Subject,
	concatMap,
	filter,
	map,
	share,
	takeUntil,
} from 'rxjs';

import { observableToAsyncIterable } from './observable-to-asynciterable.helper';

export type SubscriptionOperators<TInitial, TReturn> = Partial<{
	filter: (payload: TInitial) => boolean;
	map: (payload: TInitial) => TReturn | Promise<TReturn>;
}>;

@Injectable()
export class GraphQLSubscriptionService implements OnModuleDestroy {
	private readonly onDestroySubject = new Subject<void>();
	private readonly subscribedEvents = new Set<string>();
	private readonly eventStream$: Observable<IEvent>;

	constructor(eventBus: EventBus) {
		this.eventStream$ = eventBus.pipe(
			share(),
			takeUntil(this.onDestroySubject),
		);
	}

	onModuleDestroy(): void {
		this.onDestroySubject.next();
		this.onDestroySubject.complete();
	}

	/**
		This method creates an AsyncIterator of the EventBus event stream filtered by the event type.
		@template TEvent The event type.
		@template TReturn The return type of the AsyncIterableIterator. This is the type passed to the subscription handler (potentially user facing).
		@param {TEvent} event The event type to subscribe to.
		@param {string} fieldName The Graphql field name to use for the payload. The event payload will always get mapped to this field name AFTER all operations.
		@param {SubscriptionOperators<TEvent, TReturn>} [operators] Optional operators to apply to the event stream. Executed in the order of filter, map.
		@returns {AsyncIterableIterator<TReturn>} An AsyncIterableIterator of events for the specified event type with the operators applied where TReturn is the type of each emitted item.
	 **/
	getSubscriptionIteratorForEvent<TEvent extends Type, TReturn>(
		event: TEvent,
		fieldName: string,
		operators?: SubscriptionOperators<InstanceType<TEvent>, TReturn>,
	): AsyncIterableIterator<TReturn> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let typeEventStream$: Observable<any> = this.eventStream$.pipe(
			ofType(event),
		);

		if (operators?.filter) {
			typeEventStream$ = typeEventStream$.pipe(filter(operators.filter));
		}
		if (operators?.map) {
			typeEventStream$ = typeEventStream$.pipe(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				concatMap(async (payload) => operators.map!(payload)),
			);
		}

		typeEventStream$ = typeEventStream$.pipe(
			map((payload) => ({ [fieldName]: payload })),
		);

		return observableToAsyncIterable(typeEventStream$);
	}
}
