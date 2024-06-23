import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';

import { ProtocolEntryBase } from '../../core/entity/protocol-entries/protocol-entry-base.entity';
import { ProtocolEntryRepository } from '../../core/repository/protocol-entry.repository';
import { ProtocolEntryMapper } from '../../mapper-profile/protocol-entry.mapper';
import { ProtocolEntryBaseDocument } from '../schema/protocol-entry-base.schema';

export class ImplProtocolEntryRepository implements ProtocolEntryRepository {
	constructor(
		@InjectModel(ProtocolEntryBaseDocument.name)
		private readonly protocolEntryModel: Model<ProtocolEntryBaseDocument>,
		private readonly mapper: ProtocolEntryMapper,
	) {}

	async create<T extends ProtocolEntryBase>(entry: T): Promise<T> {
		const document = this.mapper.map(entry);

		const protocolEntryDoc = await this.protocolEntryModel.create(document);

		const entity = this.mapper.map(
			protocolEntryDoc.toObject() as ProtocolEntryBaseDocument,
		) as unknown as T;

		return entity;
	}

	getProtocolEntryCount(organizationId: string): Promise<number> {
		return this.protocolEntryModel
			.find({ orgId: organizationId })
			.countDocuments();
	}

	async getProtocolEntries(
		organizationId: string,
		count: number,
		direction: 'preceding' | 'subsequent',
		startingFrom?: Date,
	): Promise<ProtocolEntryBase[]> {
		const query = this.getQueryForSubset(
			organizationId,
			direction === 'preceding' ? 'asc' : 'desc',
			startingFrom,
		).limit(count);

		const protocolEntries = await query.lean().exec();

		if (direction === 'preceding') {
			protocolEntries.reverse();
		}

		return protocolEntries.map((entry) => this.mapper.map(entry));
	}

	private getQueryForSubset(
		organizationId: string,
		sort: 'asc' | 'desc',
		startingFrom?: Date,
	): Query<ProtocolEntryBaseDocument[], ProtocolEntryBaseDocument> {
		const query = this.protocolEntryModel
			// we assume there are no two protocol entries with the exact same timestamp
			.find({ orgId: organizationId })
			.sort({ time: sort });

		if (startingFrom) {
			const comparator = sort === 'asc' ? '$gt' : '$lt';
			query.find({ time: { [comparator]: startingFrom.toISOString() } });
		}
		return query;
	}

	async hasProtocolEntries(
		organizationId: string,
		direction: 'preceding' | 'subsequent',
		startingFrom?: Date,
	): Promise<boolean> {
		const query = this.getQueryForSubset(
			organizationId,
			direction === 'preceding' ? 'asc' : 'desc',
			startingFrom,
		);
		const protocolEntry = await query.select('_id').findOne();

		return protocolEntry !== null;
	}
}
