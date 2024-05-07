import { Module } from '@nestjs/common';

import { StartSignInProcessHandler } from '../core/command/start-sign-in-process.command';
import { StartSignOffProcessHandler } from '../core/command/start-sign-off-process.command';
import { UpdateSignedInRescueStationHandler } from '../core/command/update-signed-in-rescue-station.command';
import { RescueStationSubscriptionResolver } from './controller/rescue-station-subscription.resolver';
import { RescueStationResolver } from './controller/rescue-station.resolver';

@Module({
	providers: [
		RescueStationSubscriptionResolver,
		RescueStationResolver,
		StartSignInProcessHandler,
		StartSignOffProcessHandler,
		UpdateSignedInRescueStationHandler,
	],
})
export class RescueStationManagerModule {}
