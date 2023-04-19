import { Injectable, OnModuleDestroy, Type } from '@nestjs/common';
import { EventBus, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, Subject, filter, map, share, takeUntil } from 'rxjs';

import { observableToAsyncIterable } from './observable-to-asynciterable.helper';

export type SubscriptionOperators<TInitial, TReturn> = Partial<{
	map: (payload: TInitial) => TReturn;
	filter: (payload: TInitial) => boolean;
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
			@param {SubscriptionOperators<TEvent, TReturn>} [operators] Optional operators to apply to the event stream.
			@returns {AsyncIterableIterator<TReturn>} An AsyncIterableIterator of events for the specified event type with the operators applied where TReturn is the type of each emitted item.
	 **/
	getSubscriptionIteratorForEvent<TEvent extends Type, TReturn>(
		event: TEvent,
		operators?: SubscriptionOperators<InstanceType<TEvent>, TReturn>,
	): AsyncIterableIterator<TReturn> {
		let typeEventStream$ = this.eventStream$.pipe(ofType(event));

		if (operators?.map) {
			typeEventStream$ = typeEventStream$.pipe(map(operators.map));
		}
		if (operators?.filter) {
			typeEventStream$ = typeEventStream$.pipe(filter(operators.filter));
		}

		return observableToAsyncIterable(typeEventStream$);
	}
}
