import { Module } from '@nestjs/common';

import { LaunchCreateOperationProcessHandler } from './core/command/launch-create-operation-process.command';
import { LaunchEndOperationProcessHandler } from './core/command/launch-end-operation-process.command';
import { UnitsPopulateService } from './core/service/units-populate.service';
import { OperationManagerResolver } from './infra/controller/operation-manager.resolver';

@Module({
	providers: [
		LaunchCreateOperationProcessHandler,
		LaunchEndOperationProcessHandler,
		UnitsPopulateService,
		OperationManagerResolver,
	],
})
export class OperationManagerModule {}
