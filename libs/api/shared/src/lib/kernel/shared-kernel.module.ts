import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { BaseModelProfile } from '../models/base-model.mapper-profile';
import { GraphQLSubscriptionService } from './graphql';
import { MongoEncryptionClientProvider } from './mongodb';
import { MongoEncryptionService } from './mongodb/mongo-encryption.service';

@Global()
@Module({
	imports: [CqrsModule],
	providers: [
		BaseModelProfile,
		GraphQLSubscriptionService,
		MongoEncryptionClientProvider,
		MongoEncryptionService,
	],
	exports: [
		BaseModelProfile,
		GraphQLSubscriptionService,
		MongoEncryptionClientProvider,
		MongoEncryptionService,
		CqrsModule,
	],
})
export class SharedKernel {}
