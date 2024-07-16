import { createUnionType } from '@nestjs/graphql';

import { CommunicationMessage } from './protocol-entries/communication-message.entity';
import { RescueStationSignOffMessage } from './protocol-entries/rescue-station/rescue-station-sign-off-message.entity';
import { RescueStationSignOnMessage } from './protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { RescueStationUpdateMessage } from './protocol-entries/rescue-station/rescue-station-update-message.entity';

export const ProtocolEntryUnion = createUnionType({
	name: 'ProtocolEntryUnion',
	types: () =>
		[
			CommunicationMessage,
			RescueStationSignOnMessage,
			RescueStationUpdateMessage,
			RescueStationSignOffMessage,
		] as const,
});
