import { IEvent } from '@nestjs/cqrs';

import { Warning } from '../model/warning.model';

export class NewWarningEvent implements IEvent {
	constructor(readonly warning: Warning) {}
}
