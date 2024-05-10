import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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

		const entity = (await this.mapper.map(
			protocolEntryDoc.toObject() as ProtocolEntryBaseDocument,
		)) as unknown as T;

		return entity;
	}

	async getPaginatedProtocolEntries(
		organizationId: string,
	): Promise<ProtocolEntryBase[]> {
		const orgDoc = await this.protocolEntryModel
			.find({ orgId: organizationId })
			.lean()
			.exec();

		return orgDoc.map((entry) => this.mapper.map(entry));
	}
}
