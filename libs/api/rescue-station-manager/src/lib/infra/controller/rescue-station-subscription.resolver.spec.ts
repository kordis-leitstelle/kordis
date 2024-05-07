import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { GraphQLSubscriptionService } from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { RescueStationSignedInEvent } from '../../core/event/rescue-station-signed-in.event';
import { RescueStationSignedOffEvent } from '../../core/event/rescue-station-signed-off.event';
import { SignedInRescueStationUpdatedEvent } from '../../core/event/signed-in-rescue-station-updated.event';
import { RescueStationSubscriptionResolver } from './rescue-station-subscription.resolver';

describe('RescueStationSubscriptionResolver', () => {
	let resolver: RescueStationSubscriptionResolver;
	let gqlSubscriptionService: GraphQLSubscriptionService;
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [
				RescueStationSubscriptionResolver,
				GraphQLSubscriptionService,
			],
		})
			.overrideProvider(QueryBus)
			.useValue(createMock<QueryBus>())
			.compile();

		resolver = module.get<RescueStationSubscriptionResolver>(
			RescueStationSubscriptionResolver,
		);
		gqlSubscriptionService = module.get<GraphQLSubscriptionService>(
			GraphQLSubscriptionService,
		);
		eventBus = module.get<EventBus>(EventBus);
		module.get<DeepMocked<QueryBus>>(QueryBus).execute.mockResolvedValue({
			id: 'rescueStationId',
		});
	});

	it('should return an iterator when rescueStationSignedIn event is fired', async () => {
		const iterator = resolver.rescueStationSignedIn({
			organizationId: 'orgId',
		} as AuthUser);

		eventBus.publish(
			new RescueStationSignedInEvent('orgId', 'rescueStationId'),
		);
		const result = await iterator.next();

		expect(result.value.rescueStationSignedIn).toBeDefined();
		expect(result.done).toBeFalsy();
	});

	it('should return an iterator when signedInRescueStationUpdated event is fired', async () => {
		const iterator = resolver.signedInRescueStationUpdated({
			organizationId: 'orgId',
		} as AuthUser);

		eventBus.publish(
			new SignedInRescueStationUpdatedEvent('orgId', 'rescueStationId'),
		);
		const result = await iterator.next();

		expect(result.value.signedInRescueStationUpdated).toEqual({
			id: 'rescueStationId',
		});
		expect(result.done).toBeFalsy();
	});

	it('should return an iterator when rescueStationSignedOff event is fired', async () => {
		const iterator = resolver.rescueStationSignedOff({
			organizationId: 'orgId',
		} as AuthUser);

		eventBus.publish(
			new RescueStationSignedOffEvent('orgId', 'rescueStationId'),
		);

		const result = await iterator.next();

		expect(result.value.rescueStationSignedOff).toEqual({
			id: 'rescueStationId',
		});
		expect(result.done).toBeFalsy();
	});
});
