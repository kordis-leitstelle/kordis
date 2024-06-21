import { Module } from '@nestjs/common';

import { MessageCommandRescueStationDetailsFactory } from '../core/command/message-command-rescue-station-details.factory';
import { StartSignOffProcessHandler } from '../core/command/start-sign-off-process.command';
import { StartSignOnProcessHandler } from '../core/command/start-sign-on-process.command';
import { StartUpdateSignedInRescueStationProcessHandler } from '../core/command/start-update-signed-in-rescue-station-process.command';
import { RescueStationSubscriptionResolver } from './controller/rescue-station-subscription.resolver';
import { RescueStationResolver } from './controller/rescue-station.resolver';

@Module({
	providers: [
		RescueStationSubscriptionResolver,
		RescueStationResolver,
		StartSignOnProcessHandler,
		StartSignOffProcessHandler,
		StartUpdateSignedInRescueStationProcessHandler,
		MessageCommandRescueStationDetailsFactory,
	],
})
export class RescueStationManagerModule {}
