import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { GraphQLSubscriptionService } from './graphql-subscription.service';

class TestEvent {
	constructor(public readonly someProperty: string) {}
}

class TestEvent2 {
	constructor(public readonly someProperty: string) {}
}
describe('GraphQLSubscriptionService', () => {
	let service: GraphQLSubscriptionService;
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [GraphQLSubscriptionService],
		}).compile();

		service = module.get<GraphQLSubscriptionService>(
			GraphQLSubscriptionService,
		);
		eventBus = module.get<EventBus>(EventBus);
	});

	describe('getSubscriptionIteratorForEvent', () => {
		it('should return requested event via AsyncIterator', async () => {
			const subscriptionIterator =
				service.getSubscriptionIteratorForEvent(TestEvent);

			eventBus.publish(new TestEvent('event of interest 1'));
			eventBus.publish(new TestEvent2('not interesting'));
			eventBus.publish(new TestEvent2('not interesting'));
			eventBus.publish(new TestEvent('event of interest 2'));

			await expect(subscriptionIterator.next()).resolves.toEqual({
				done: false,
				value: {
					someProperty: 'event of interest 1',
				},
			});
			await expect(subscriptionIterator.next()).resolves.toEqual({
				done: false,
				value: {
					someProperty: 'event of interest 2',
				},
			});
		});

		it('should apply map and filter operators to the event stream', async () => {
			const map = jest.fn(() => ({
				someProperty: 'bar',
			}));
			const filter = jest.fn((payload) => payload.someProperty.length >= 3);

			const subscriptionIterator = service.getSubscriptionIteratorForEvent(
				TestEvent,
				{ filter, map },
			);

			eventBus.publish(new TestEvent('foo'));

			expect(filter).toHaveBeenCalled();
			expect(map).toHaveBeenCalled();
			await expect(subscriptionIterator.next()).resolves.toEqual({
				done: false,
				value: {
					someProperty: 'bar',
				},
			});
		});
	});

	it('should filter event with filter operator', async () => {
		const filter = (payload: TestEvent) => payload.someProperty.length > 3;

		const subscriptionIterator = service.getSubscriptionIteratorForEvent(
			TestEvent,
			{ filter },
		);

		eventBus.publish(new TestEvent('foo'));
		eventBus.publish(new TestEvent('foobar'));

		await expect(subscriptionIterator.next()).resolves.toEqual({
			done: false,
			value: {
				someProperty: 'foobar',
			},
		});
	});
});
