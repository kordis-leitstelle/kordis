import { Injectable, Type } from '@nestjs/common';
import { EventBus, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, filter, map, share, takeUntil } from 'rxjs';

import { observableToAsyncIterable } from '../../../helpers/observable-to-asynciterable.helper';
import { WithDestroySubject } from '../../../helpers/with-destroy-subject';

export type SubscriptionOperators<TInitial, TReturn> = Partial<{
	map: (payload: TInitial) => TReturn;
	filter: (payload: TInitial) => boolean;
}>;

@Injectable()
export class GraphQLSubscriptionService extends WithDestroySubject {
	private readonly eventStream$: Observable<IEvent>;

	constructor(eventBus: EventBus) {
		super();
		this.eventStream$ = eventBus.pipe(
			share(),
			takeUntil(this.onDestroySubject),
		);
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
