import { ProtocolEntryBase } from '../entity/protocol-entries/protocol-entry-base.entity';

export const PROTOCOL_ENTRY_REPOSITORY = Symbol('ProtocolEntryRepository');

export interface ProtocolEntryRepository {
	create<T extends ProtocolEntryBase>(entry: T): Promise<T>;

	getProtocolEntryCount(organizationId: string): Promise<number>;

	/**
	 * Returns the protocol entries sorted by time desc.
	 */
	getProtocolEntries(
		organizationId: string,
		count: number,
		direction: 'preceding' | 'subsequent',
		startingFrom?: Date,
	): Promise<ProtocolEntryBase[]>;

	hasProtocolEntries(
		organizationId: string,
		direction: 'preceding' | 'subsequent',
		startingFrom?: Date,
	): Promise<boolean>;
}
