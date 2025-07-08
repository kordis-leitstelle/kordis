import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ProviderConfigs } from '../../core/entity/alert-org-config.entity';
import { AlertOrgConfigRepository } from '../../core/repo/alert-org-config.repository';
import { ConfigNotFoundError } from '../error/config-not-found.error';
import { mapOrgConfig } from '../mapper/alert-org-config.mapper';
import {
	AlertOrgConfigBaseDocument,
	AlertingProviders,
} from '../schema/alerting-org-config.schema';

@Injectable()
export class AlertOrgConfigRepositoryImpl implements AlertOrgConfigRepository {
	constructor(
		@InjectModel(AlertOrgConfigBaseDocument.name)
		private readonly alertOrgConfigModel: Model<AlertOrgConfigBaseDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async findByOrgId(orgId: string): Promise<ProviderConfigs> {
		const res = await this.alertOrgConfigModel.findOne({ orgId }).lean().exec();

		if (!res) {
			throw new ConfigNotFoundError(orgId);
		}
		if (res.type === AlertingProviders.MOCK) {
			return 'MOCK';
		}
		return mapOrgConfig(res, this.mapper);
	}
}
