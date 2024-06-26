import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { BaseModelProfile } from '../models/base-model.mapper-profile';
import { DataLoaderContainer, GraphQLSubscriptionService } from './graphql';
import { MongoEncryptionClientProvider } from './mongodb';
import { MongoEncryptionService } from './mongodb/mongo-encryption.service';
import { RetainOrderService } from './service/retain-order.service';
import {
	UNIT_OF_WORK_SERVICE,
	UnitOfWorkServiceImpl,
} from './service/unit-of-work.service';

@Global()
@Module({
	imports: [CqrsModule],
	providers: [
		BaseModelProfile,
		DataLoaderContainer,
		GraphQLSubscriptionService,
		MongoEncryptionClientProvider,
		MongoEncryptionService,
		RetainOrderService,
		{ provide: UNIT_OF_WORK_SERVICE, useClass: UnitOfWorkServiceImpl },
	],
	exports: [
		BaseModelProfile,
		CqrsModule,
		DataLoaderContainer,
		GraphQLSubscriptionService,
		MongoEncryptionClientProvider,
		MongoEncryptionService,
		RetainOrderService,
		UNIT_OF_WORK_SERVICE,
	],
})
export class SharedKernel {}
