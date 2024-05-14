import { ProtocolEntryBase } from '../entity/protocol-entries/protocol-entry-base.entity';

export const PROTOCOL_ENTRY_REPOSITORY = Symbol('ProtocolEntryRepository');

export interface ProtocolEntryRepository {
	create<T extends ProtocolEntryBase>(entry: T): Promise<T>;

	getProtocolEntryCount(organizationId: string): Promise<number>;

	getProtocolEntries(
		organizationId: string,
		count: number,
		sort: 'asc' | 'desc',
		startingFrom?: Date,
	): Promise<ProtocolEntryBase[]>;

	hasProtocolEntries(
		organizationId: string,
		sort: 'asc' | 'desc',
		startingFrom?: Date,
	): Promise<boolean>;
}
