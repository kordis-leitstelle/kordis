import { AuthUser } from '@kordis/shared/model';

import {
	RegisteredUnit,
	UnknownUnit,
} from '../entity/partials/unit-partial.entity';

export interface BaseCreateCommunicationMessageCommand {
	readonly time: Date;
	readonly sender: RegisteredUnit | UnknownUnit;
	readonly recipient: RegisteredUnit | UnknownUnit;
	readonly channel: string;
	readonly requestUser: AuthUser;
}
