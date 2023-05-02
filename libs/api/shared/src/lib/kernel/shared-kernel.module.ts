import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GraphQLSubscriptionService } from './graphql/subscriptions/graphql-subscription.service';

@Module({
	imports: [CqrsModule],
	providers: [GraphQLSubscriptionService],
})
export class SharedKernel {}
