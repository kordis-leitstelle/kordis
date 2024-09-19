import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { GraphQLSubscriptionService } from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { RescueStationSignedOffEvent } from '../../core/event/rescue-station-signed-off.event';
import { RescueStationSignedOnEvent } from '../../core/event/rescue-station-signed-on.event';
import { SignedInRescueStationUpdatedEvent } from '../../core/event/signed-in-rescue-station-updated.event';
import { RescueStationSubscriptionResolver } from './rescue-station-subscription.resolver';

describe('RescueStationSubscriptionResolver', () => {
	let resolver: RescueStationSubscriptionResolver;
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
		eventBus = module.get<EventBus>(EventBus);
		module.get<DeepMocked<QueryBus>>(QueryBus).execute.mockResolvedValue({
			id: 'rescueStationId',
		});
	});

	it('should emit subscription on RescueStationSignedOnEvent', async () => {
		const iterator = resolver.rescueStationSignedIn({
			organizationId: 'orgId',
		} as AuthUser);

		eventBus.publish(
			new RescueStationSignedOnEvent('orgId', 'rescueStationId'),
		);
		const result = await iterator.next();

		expect(result.value.rescueStationSignedIn).toBeDefined();
		expect(result.done).toBeFalsy();
	});

	it('should emit subscription on signedInRescueStationUpdated', async () => {
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

	it('should emit subscription on RescueStationSignedOffEvent', async () => {
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
