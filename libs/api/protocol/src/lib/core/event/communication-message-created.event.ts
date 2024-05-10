import { CommunicationMessage } from '../entity/protocol-entries/communication-message.entity';

export class CommunicationMessageCreatedEvent {
	constructor(public readonly communicationMessage: CommunicationMessage) {}
}
