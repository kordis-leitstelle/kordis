import { Module } from '@nestjs/common';

import { LaunchSignOffProcessHandler } from '../core/command/launch-sign-off-process.command';
import { LaunchSignOnProcessHandler } from '../core/command/launch-sign-on-process.command';
import { LaunchUpdateSignedInRescueStationProcessHandler } from '../core/command/launch-update-signed-in-rescue-station-process.command';
import { RescueStationMessageDetailsFactory } from '../core/command/rescue-station-message-details-factory.service';
import { RescueStationSubscriptionResolver } from './controller/rescue-station-subscription.resolver';
import { RescueStationResolver } from './controller/rescue-station.resolver';

@Module({
	providers: [
		RescueStationSubscriptionResolver,
		RescueStationResolver,
		LaunchSignOnProcessHandler,
		LaunchSignOffProcessHandler,
		LaunchUpdateSignedInRescueStationProcessHandler,
		RescueStationMessageDetailsFactory,
	],
})
export class RescueStationManagerModule {}
