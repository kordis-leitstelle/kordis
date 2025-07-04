import { ProviderConfigs } from '../entity/alert-org-config.entity';

export const ALERT_ORG_CONFIG_REPOSITORY = Symbol(
	'ALERT_ORG_CONFIG_REPOSITORY',
);

export interface AlertOrgConfigRepository {
	findByOrgId(orgId: string): Promise<ProviderConfigs>;
}
