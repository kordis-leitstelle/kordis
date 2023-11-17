import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GraphQLSubscriptionService } from './graphql/subscriptions/graphql-subscription.service';
import { MongoEncryptionClientProvider } from './mongodb';
import { MongoEncryptionService } from './mongodb/mongo-encryption.service';

@Module({
	imports: [CqrsModule],
	providers: [
		GraphQLSubscriptionService,
		MongoEncryptionClientProvider,
		MongoEncryptionService,
	],
	exports: [
		GraphQLSubscriptionService,
		MongoEncryptionClientProvider,
		MongoEncryptionService,
	],
})
export class SharedKernel {}
