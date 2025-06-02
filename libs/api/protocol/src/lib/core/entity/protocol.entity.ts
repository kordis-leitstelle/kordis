import { createUnionType } from '@nestjs/graphql';

import { CommunicationMessage } from './protocol-entries/communication-message.entity';
import { OperationEndedMessage } from './protocol-entries/operation/operation-ended-message.entity';
import { OperationStartedMessage } from './protocol-entries/operation/operation-started-message.entity';
import { RescueStationSignOffMessage } from './protocol-entries/rescue-station/rescue-station-sign-off-message.entity';
import { RescueStationSignOnMessage } from './protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { RescueStationUpdateMessage } from './protocol-entries/rescue-station/rescue-station-update-message.entity';

export const ProtocolEntryUnion = createUnionType({
	name: 'ProtocolEntryUnion',
	types: () =>
		[
			CommunicationMessage,
			OperationEndedMessage,
			OperationStartedMessage,
			RescueStationSignOffMessage,
			RescueStationSignOnMessage,
			RescueStationUpdateMessage,
		] as const,
});
