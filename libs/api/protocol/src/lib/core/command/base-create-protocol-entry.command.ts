import { AuthUser } from '@kordis/shared/model';

import { MessageUnit } from '../entity/partials/unit-partial.entity';

export interface BaseCreateProtocolEntryCommand {
	readonly time: Date;
	readonly protocolData: {
		readonly sender: MessageUnit;
		readonly recipient: MessageUnit;
		readonly channel: string;
	} | null;
	readonly requestUser: AuthUser;
}
