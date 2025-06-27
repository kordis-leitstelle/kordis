import { Module } from '@nestjs/common';

import { LaunchChangeOngoingOperationInvolvementsHandler } from './core/command/launch-change-ongoing-operation-involvements.command';
import { LaunchCreateOngoingOperationProcessHandler } from './core/command/launch-create-ongoing-operation-process.command';
import { LaunchEndOperationProcessHandler } from './core/command/launch-end-operation-process.command';
import { UnitsPopulateService } from './core/service/units-populate.service';
import { OperationManagerResolver } from './infra/controller/operation-manager.resolver';

@Module({
	providers: [
		LaunchCreateOngoingOperationProcessHandler,
		LaunchChangeOngoingOperationInvolvementsHandler,
		LaunchEndOperationProcessHandler,
		UnitsPopulateService,
		OperationManagerResolver,
	],
})
export class OperationManagerModule {}
