import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ALERT_SERVICE } from './core/alert.service';
import { CreateAlertForOperationCommandHandler } from './core/command/create-alert-for-operation.command';
import { ALERT_GROUP_CONFIG_REPOSITORY } from './core/repo/alert-group-config.repository';
import { ALERT_ORG_CONFIG_REPOSITORY } from './core/repo/alert-org-config.repository';
import { AlertGroupConfigProfile } from './infra/mapper/alert-group-config.mapper';
import { AlertOrgConfigProfile } from './infra/mapper/alert-org-config.mapper';
import { AlertGroupConfigRepositoryImpl } from './infra/repo/alert-group-config.repository';
import { AlertOrgConfigRepositoryImpl } from './infra/repo/alert-org-config.repository';
import {
	AlertGroupConfigBaseDocument,
	AlertGroupConfigBaseSchema,
	AlertGroupDiveraConfigSchema,
} from './infra/schema/alert-group-config.schema';
import {
	AlertOrgConfigBaseDocument,
	AlertingOrgConfigBaseSchema,
	AlertingProviders,
	DiveraConfigSchema,
} from './infra/schema/alerting-org-config.schema';
import { DiveraProvider } from './infra/service/alert-provider/divera.provider';
import { MockAlertingProvider } from './infra/service/alert-provider/mock.provider';
import { AlertingFacade } from './infra/service/alerting.facade';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: AlertOrgConfigBaseDocument.name,
				schema: AlertingOrgConfigBaseSchema,
				discriminators: [
					{
						name: AlertingProviders.DIVERA,
						schema: DiveraConfigSchema,
					},
				],
			},
			{
				name: AlertGroupConfigBaseDocument.name,
				schema: AlertGroupConfigBaseSchema,
				discriminators: [
					{
						name: AlertingProviders.DIVERA,
						schema: AlertGroupDiveraConfigSchema,
					},
				],
			},
		]),
	],
	providers: [
		{
			provide: ALERT_SERVICE,
			useClass: AlertingFacade,
		},
		{
			provide: ALERT_GROUP_CONFIG_REPOSITORY,
			useClass: AlertGroupConfigRepositoryImpl,
		},
		{
			provide: ALERT_ORG_CONFIG_REPOSITORY,
			useClass: AlertOrgConfigRepositoryImpl,
		},
		AlertGroupConfigProfile,
		AlertOrgConfigProfile,
		DiveraProvider,
		MockAlertingProvider,
		CreateAlertForOperationCommandHandler,
		{
			provide: 'ALERT_PROVIDERS',
			useFactory: (divera: DiveraProvider, mock: MockAlertingProvider) => [
				divera,
				mock,
			],
			inject: [DiveraProvider, MockAlertingProvider],
		},
	],
})
export class AlertingModule {}
