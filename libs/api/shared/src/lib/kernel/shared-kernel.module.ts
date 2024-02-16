import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GraphQLSubscriptionService } from './graphql';
import { MongoEncryptionClientProvider } from './mongodb';
import { MongoEncryptionService } from './mongodb/mongo-encryption.service';

@Global()
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
		CqrsModule,
	],
})
export class SharedKernel {}
