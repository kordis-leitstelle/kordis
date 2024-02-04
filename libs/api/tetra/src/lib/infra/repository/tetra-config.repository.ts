import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TetraConfig } from '../../core/entity/tetra-config.entitiy';
import { TetraConfigRepository } from '../../core/repository/tetra-config.repository';
import { TetraConfigDocument } from '../schema/tetra-config.schema';

export class TetraConfigRepositoryImpl implements TetraConfigRepository {
	constructor(
		@InjectModel(TetraConfigDocument.name)
		private readonly tetraConfigModel: Model<TetraConfigDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async findByOrgId(orgId: string): Promise<TetraConfig | null> {
		const doc = await this.tetraConfigModel.findOne({ orgId }).lean().exec();

		if (!doc) {
			return null;
		}

		return this.mapper.mapAsync(doc, TetraConfigDocument, TetraConfig);
	}

	async findByWebhookAccessKey(key: string): Promise<TetraConfig | null> {
		const doc = await this.tetraConfigModel
			.findOne({
				webhookAccessKey: key,
			})
			.lean()
			.exec();

		if (!doc) {
			return null;
		}

		return this.mapper.mapAsync(doc, TetraConfigDocument, TetraConfig);
	}
}
