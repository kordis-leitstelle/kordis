import { AlertGroupConfig } from '../entity/alert-group-config.entity';

export const ALERT_GROUP_CONFIG_REPOSITORY = Symbol(
	'ALERT_GROUP_CONFIG_REPOSITORY',
);

export interface AlertGroupConfigRepository {
	getAlertGroupConfigs(
		alertGroupIds: string[],
		orgId: string,
	): Promise<AlertGroupConfig[]>;
}
