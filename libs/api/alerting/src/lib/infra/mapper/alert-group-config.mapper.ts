import { Mapper, createMap } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseMapperProfile } from '@kordis/api/shared';

import { AlertGroupDiveraConfig } from '../../core/entity/alert-group-config.entity';
import {
	AlertGroupConfigBaseDocument,
	AlertGroupDiveraConfigDocument,
} from '../schema/alert-group-config.schema';
import { AlertingProviders } from '../schema/alerting-org-config.schema';

@Injectable()
export class AlertGroupConfigProfile extends BaseMapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, AlertGroupDiveraConfigDocument, AlertGroupDiveraConfig);
		};
	}
}

// Currently, each org can only have a single provider; thus all alert group configs are from one provider.
export async function mapAlertGroupConfigs(
	alertGroupConfigs: AlertGroupConfigBaseDocument[],
	mapper: Mapper,
): Promise<AlertGroupDiveraConfig[]> {
	if (alertGroupConfigs[0]?.type === AlertingProviders.DIVERA) {
		return mapper.mapArrayAsync(
			alertGroupConfigs,
			AlertGroupDiveraConfigDocument,
			AlertGroupDiveraConfig,
		);
	} else if (alertGroupConfigs.length === 0) {
		return [];
	} else {
		throw new Error('Unknown alerting provider');
	}
}
