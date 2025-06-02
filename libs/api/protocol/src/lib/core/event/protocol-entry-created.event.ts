import { ProtocolEntryBase } from '../entity/protocol-entries/protocol-entry.entity';

export class ProtocolEntryCreatedEvent {
	constructor(
		public readonly orgId: string,
		public readonly protocolEntry: ProtocolEntryBase,
	) {}
}
