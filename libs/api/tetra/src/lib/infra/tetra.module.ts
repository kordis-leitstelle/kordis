import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { HandleTetraControlWebhookHandler } from '../core/command/handle-tetra-control-webhook.command';
import { SendTetraSDSHandler } from '../core/command/send-tetra-sds.command';
import { TETRA_CONFIG_REPOSITORY } from '../core/repository/tetra-config.repository';
import { TETRA_SERVICE } from '../core/service/tetra.service';
import { TetraControlWebhookController } from './controller/tetra-control-webhook.controller';
import { TetraConfigRepositoryImpl } from './repository/tetra-config.repository';
import {
	TetraConfigDocument,
	TetraConfigSchema,
} from './schema/tetra-config.schema';
import { TetraControlService } from './service/tetra-control.service';
import { TetraConfigMapperProfile } from './tetra-config.mapper-profile';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: TetraConfigDocument.name,
				schema: TetraConfigSchema,
			},
		]),
		CqrsModule,
		HttpModule,
	],
	controllers: [TetraControlWebhookController],
	providers: [
		TetraConfigMapperProfile,
		{
			provide: TETRA_SERVICE,
			useClass: TetraControlService,
		},
		{
			provide: TETRA_CONFIG_REPOSITORY,
			useClass: TetraConfigRepositoryImpl,
		},
		HandleTetraControlWebhookHandler,
		SendTetraSDSHandler,
	],
})
export class TetraModule {}
