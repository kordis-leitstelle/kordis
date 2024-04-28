import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AlertGroupEntity } from '../../core/entity/alert-group.entity';
import { AlertGroupRepository } from '../../core/repository/alert-group.repository';
import { AlertGroupDocument } from '../schema/alert-group.schema';

@Injectable()
export class AlertGroupRepositoryImpl implements AlertGroupRepository {
	constructor(
		@InjectModel(AlertGroupDocument.name)
		private readonly alertGroupModel: Model<AlertGroupDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async findByOrgId(orgId: string): Promise<AlertGroupEntity[]> {
		const alertGroups = await this.alertGroupModel
			.find({ orgId })
			.populate('units')
			.lean()
			.exec();

		return this.mapper.mapArrayAsync(
			alertGroups,
			AlertGroupDocument,
			AlertGroupEntity,
		);
	}

	async findById(orgId: string, id: string): Promise<AlertGroupEntity> {
		const alertGroup = await this.alertGroupModel
			.findOne({ _id: id, orgId })
			.populate('units')
			.lean()
			.exec();

		return this.mapper.mapAsync(
			alertGroup,
			AlertGroupDocument,
			AlertGroupEntity,
		);
	}

	async findByIds(ids: string[]): Promise<AlertGroupEntity[]> {
		const alertGroups = await this.alertGroupModel
			.find({ _id: { $in: ids } })
			.populate('units')
			.lean()
			.exec();

		return this.mapper.mapArrayAsync(
			alertGroups,
			AlertGroupDocument,
			AlertGroupEntity,
		);
	}
}
