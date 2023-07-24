import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GraphQLSubscriptionService } from './graphql/subscriptions/graphql-subscription.service';

@Global()
@Module({
	imports: [CqrsModule],
	providers: [GraphQLSubscriptionService],
	exports: [GraphQLSubscriptionService, CqrsModule],
})
export class SharedKernel {}
