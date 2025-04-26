import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AlertGroupConfig } from '../../core/entity/alert-group-config.entity';
import { AlertGroupConfigRepository } from '../../core/repo/alert-group-config.repository';
import { mapAlertGroupConfigs } from '../mapper/alert-group-config.mapper';
import { AlertGroupConfigBaseDocument } from '../schema/alert-group-config.schema';

@Injectable()
export class AlertGroupConfigRepositoryImpl
	implements AlertGroupConfigRepository
{
	constructor(
		@InjectModel(AlertGroupConfigBaseDocument.name)
		private readonly alertGroupConfigModel: Model<AlertGroupConfigBaseDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async getAlertGroupConfigs(
		alertGroupIds: string[],
		orgId: string,
	): Promise<AlertGroupConfig[]> {
		const res = await this.alertGroupConfigModel
			.find({
				alertGroupId: { $in: alertGroupIds },
				orgId,
			})
			.lean()
			.exec();
		return mapAlertGroupConfigs(res, this.mapper);
	}
}
