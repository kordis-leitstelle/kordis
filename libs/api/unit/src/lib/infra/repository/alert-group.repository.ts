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
			.populate('defaultUnits')
			.populate('currentUnits')
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
			.populate('defaultUnits')
			.populate('currentUnits')
			.lean()
			.exec();

		return this.mapper.mapAsync(
			alertGroup,
			AlertGroupDocument,
			AlertGroupEntity,
		);
	}

	async findByIds(ids: string[], orgId?: string): Promise<AlertGroupEntity[]> {
		const alertGroups = await this.alertGroupModel
			.find({ _id: { $in: ids }, orgId })
			.populate('defaultUnits')
			.populate('currentUnits')
			.lean()
			.exec();

		return this.mapper.mapArrayAsync(
			alertGroups,
			AlertGroupDocument,
			AlertGroupEntity,
		);
	}

	async updateCurrentUnits(
		orgId: string,
		alertGroupId: string,
		unitIds: string[],
	): Promise<boolean> {
		const res = await this.alertGroupModel.updateOne(
			{ _id: alertGroupId, orgId },
			{ $set: { currentUnits: unitIds } },
		);

		return res.modifiedCount > 0;
	}

	async resetCurrentUnitsToDefaultUnits(orgId: string): Promise<void> {
		await this.alertGroupModel.updateMany(
			{
				orgId,
			},
			[
				{
					$set: {
						currentUnits: '$defaultUnits',
					},
				},
			],
		);
	}
}
