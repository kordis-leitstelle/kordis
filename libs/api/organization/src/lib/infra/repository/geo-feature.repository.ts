import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Promise } from 'mongoose';

import { GeoFeature } from '../../core/entity/geo-features.entity';
import { GeoFeatureRepository } from '../../core/repository/geo-feature.repository';
import { GeoFeatureDocument } from '../schema/geo-feature.schema';

@Injectable()
export class GeoFeatureRepositoryImpl implements GeoFeatureRepository {
	constructor(
		@InjectModel(GeoFeatureDocument.name)
		private readonly geoFeatureModel: Model<GeoFeatureDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async findAll(orgId: string): Promise<GeoFeature[]> {
		const docs = await this.geoFeatureModel
			.find({
				orgId,
			})
			.lean()
			.exec();

		return this.mapper.mapArrayAsync(docs, GeoFeatureDocument, GeoFeature);
	}
}
