import { Module } from '@nestjs/common';

import { PublishTetraStatusHandler } from './core/command/publish-tetra-status.command';
import { SendTetraSDSHandler } from './core/command/send-tetra-sds.command';
import { TETRA_SERVICE } from './core/service/tetra.service';
import { TetraControlWebhookController } from './infra/controller/tetra-control-webhook.controller';
import { TetraControlService } from './infra/service/tetra-control.service';

@Module({
	controllers: [TetraControlWebhookController],
	providers: [
		{
			provide: TETRA_SERVICE,
			useClass: TetraControlService,
		},
		PublishTetraStatusHandler,
		SendTetraSDSHandler,
	],
})
export class RadioCommunicationSystemModule {}
