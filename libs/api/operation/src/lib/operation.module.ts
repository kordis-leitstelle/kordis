import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateOperationCommandHandler } from './core/command/create-operation.command';
import { OPERATION_REPOSITORY } from './core/repository/operation.repository';
import { SIGN_GENERATOR } from './core/service/sign-generator.strategy';
import { YearMonthCounterSignGenerator } from './core/service/year-month-counter-sign-generator.strategy';
import { OperationResolver } from './infra/controller/operation.resolver';
import { OperationRepositoryImpl } from './infra/repository/operation.repository';
import {
	OperationDocument,
	OperationSchema,
} from './infra/schema/operation.schema';
import { OperationProfile } from './operation.mapper-profile';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: OperationDocument.name,
				schema: OperationSchema,
			},
		]),
	],
	providers: [
		OperationProfile,
		{
			provide: OPERATION_REPOSITORY,
			useClass: OperationRepositoryImpl,
		},
		{
			provide: SIGN_GENERATOR,
			useClass: YearMonthCounterSignGenerator,
		},
		CreateOperationCommandHandler,
		OperationResolver,
	],
	exports: [],
})
export class OperationModule {}
