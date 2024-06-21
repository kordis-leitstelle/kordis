import { QueryBus } from '@nestjs/cqrs';
import { Resolver, Subscription } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import {
	GetRescueStationDeploymentQuery,
	RescueStationDeploymentViewModel,
} from '@kordis/api/deployment';
import {
	GraphQLSubscriptionService,
	SubscriptionOperators,
} from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { RescueStationSignedOffEvent } from '../../core/event/rescue-station-signed-off.event';
import { RescueStationSignedOnEvent } from '../../core/event/rescue-station-signed-on.event';
import { SignedInRescueStationUpdatedEvent } from '../../core/event/signed-in-rescue-station-updated.event';

@Resolver()
export class RescueStationSubscriptionResolver {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly gqlSubscriptionService: GraphQLSubscriptionService,
	) {}

	@Subscription(() => RescueStationDeploymentViewModel)
	rescueStationSignedIn(
		@RequestUser() { organizationId: authUserOrgId }: AuthUser,
	): AsyncIterableIterator<RescueStationDeploymentViewModel> {
		return this.gqlSubscriptionService.getSubscriptionIteratorForEvent(
			RescueStationSignedOnEvent,
			'rescueStationSignedIn',
			this.operatorFactory(authUserOrgId),
		);
	}

	@Subscription(() => RescueStationDeploymentViewModel)
	signedInRescueStationUpdated(
		@RequestUser() { organizationId: authUserOrgId }: AuthUser,
	): AsyncIterableIterator<RescueStationDeploymentViewModel> {
		return this.gqlSubscriptionService.getSubscriptionIteratorForEvent(
			SignedInRescueStationUpdatedEvent,
			'signedInRescueStationUpdated',
			this.operatorFactory(authUserOrgId),
		);
	}

	@Subscription(() => RescueStationDeploymentViewModel)
	rescueStationSignedOff(
		@RequestUser() { organizationId: authUserOrgId }: AuthUser,
	): AsyncIterableIterator<RescueStationDeploymentViewModel> {
		return this.gqlSubscriptionService.getSubscriptionIteratorForEvent(
			RescueStationSignedOffEvent,
			'rescueStationSignedOff',
			this.operatorFactory(authUserOrgId),
		);
	}

	private operatorFactory(
		authOrgId: string,
	): SubscriptionOperators<
		| RescueStationSignedOffEvent
		| RescueStationSignedOnEvent
		| SignedInRescueStationUpdatedEvent,
		RescueStationDeploymentViewModel
	> {
		return {
			filter: ({ orgId }) => orgId === authOrgId,
			map: ({ rescueStationId }) =>
				this.queryBus.execute(
					new GetRescueStationDeploymentQuery(authOrgId, rescueStationId),
				),
		};
	}
}
