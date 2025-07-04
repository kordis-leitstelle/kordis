import { Mapper, createMap } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseMapperProfile } from '@kordis/api/shared';

import {
	DiveraOrgConfig,
	ProviderConfigs,
} from '../../core/entity/alert-org-config.entity';
import {
	AlertOrgConfigBaseDocument,
	AlertingProviders,
	DiveraOrgConfigDocument,
} from '../schema/alerting-org-config.schema';

@Injectable()
export class AlertOrgConfigProfile extends BaseMapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap<DiveraOrgConfigDocument, DiveraOrgConfig>(
				mapper,
				DiveraOrgConfigDocument,
				DiveraOrgConfig,
			);
		};
	}
}

export async function mapOrgConfig(
	orgConfig: AlertOrgConfigBaseDocument,
	mapper: Mapper,
): Promise<ProviderConfigs> {
	if (orgConfig.type === AlertingProviders.DIVERA) {
		return mapper.mapAsync(orgConfig, DiveraOrgConfigDocument, DiveraOrgConfig);
	} else {
		throw new Error('Unknown alerting provider');
	}
}
