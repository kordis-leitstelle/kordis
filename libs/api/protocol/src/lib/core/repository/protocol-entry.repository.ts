import { ProtocolEntryBase } from '../entity/protocol-entries/protocol-entry-base.entity';

export const PROTOCOL_ENTRY_REPOSITORY = Symbol('ProtocolEntryRepository');

export interface ProtocolEntryRepository {
	create<T extends ProtocolEntryBase>(entry: T): Promise<T>;

	// TODO: refactor naming
	// TODO: Create pagination
	getPaginatedProtocolEntries(
		organizationId: string,
	): Promise<ProtocolEntryBase[]>;
}
