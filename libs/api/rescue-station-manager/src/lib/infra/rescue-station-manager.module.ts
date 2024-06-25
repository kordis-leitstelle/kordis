import { Module } from '@nestjs/common';

import { LaunchSignOffProcessHandler } from '../core/command/launch-sign-off-process.command';
import { LaunchSignOnProcessHandler } from '../core/command/launch-sign-on-process.command';
import { LaunchUpdateSignedInRescueStationProcessHandler } from '../core/command/launch-update-signed-in-rescue-station-process.command';
import { MessageCommandRescueStationDetailsFactory } from '../core/command/message-command-rescue-station-details.factory';
import { RescueStationSubscriptionResolver } from './controller/rescue-station-subscription.resolver';
import { RescueStationResolver } from './controller/rescue-station.resolver';

@Module({
	providers: [
		RescueStationSubscriptionResolver,
		RescueStationResolver,
		LaunchSignOnProcessHandler,
		LaunchSignOffProcessHandler,
		LaunchUpdateSignedInRescueStationProcessHandler,
		MessageCommandRescueStationDetailsFactory,
	],
})
export class RescueStationManagerModule {}
