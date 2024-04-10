import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DataLoaderContainer, GraphQLSubscriptionService } from './graphql';
import { MongoEncryptionClientProvider } from './mongodb';
import { MongoEncryptionService } from './mongodb/mongo-encryption.service';

@Global()
@Module({
	imports: [CqrsModule],
	providers: [
		DataLoaderContainer,
		GraphQLSubscriptionService,
		MongoEncryptionClientProvider,
		MongoEncryptionService,
	],
	exports: [
		GraphQLSubscriptionService,
		MongoEncryptionClientProvider,
		MongoEncryptionService,
		CqrsModule,
		DataLoaderContainer,
	],
})
export class SharedKernel {}
