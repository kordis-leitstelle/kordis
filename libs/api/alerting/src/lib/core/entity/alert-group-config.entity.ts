import { AutoMap } from '@automapper/classes';

export type AlertGroupConfig = AlertGroupDiveraConfig;

export class BaseAlertGroupConfig {
	@AutoMap()
	alertGroupId: string;
}

export class AlertGroupDiveraConfig extends BaseAlertGroupConfig {
	@AutoMap()
	diveraGroupId: string;
}
