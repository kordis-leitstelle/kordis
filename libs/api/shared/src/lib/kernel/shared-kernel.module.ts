import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GraphQLSubscriptionService } from './graphql/subscriptions/graphql-subscription.service';

@Module({
	imports: [CqrsModule],
	providers: [GraphQLSubscriptionService],
	exports: [GraphQLSubscriptionService],
})
export class SharedKernel {
	private readonly logger = new Logger(SharedKernel.name);

	constructor() {
		this.logger.log('SharedKernel loaded');
	}
}
