import { ProtocolEntryBase } from '../entity/protocol-entries/protocol-entry-base.entity';

export class ProtocolEntryCreatedEvent {
	constructor(
		public readonly orgId: string,
		public readonly protocolEntry: ProtocolEntryBase,
	) {}
}
