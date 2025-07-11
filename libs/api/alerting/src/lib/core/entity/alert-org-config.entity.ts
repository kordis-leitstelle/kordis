import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

import { BaseEntityModel } from '@kordis/api/shared';

export type ProviderConfigs = DiveraOrgConfig | 'MOCK';

export class DiveraOrgConfig extends BaseEntityModel {
	@AutoMap()
	@IsString()
	token: string;
}
