import { Module } from '@nestjs/common';

import { LaunchCreateOperationProcessHandler } from './core/command/launch-create-operation-process.command';
import { LaunchEndOperationProcessHandler } from './core/command/launch-end-operation-process.command';
import { LaunchUpdateOngoingInvolvementsProcessHandler } from './core/command/launch-update-ongoing-involvements-process.command';
import { UnitsEnricherService } from './core/service/units-enricher.service';
import { OperationManagerResolver } from './infra/controller/operation-manager.resolver';


@Module({
	providers: [
		LaunchCreateOperationProcessHandler,
		LaunchEndOperationProcessHandler,
		LaunchUpdateOngoingInvolvementsProcessHandler,
		UnitsEnricherService,
		OperationManagerResolver,
	],
})
export class OperationManagerModule {}
