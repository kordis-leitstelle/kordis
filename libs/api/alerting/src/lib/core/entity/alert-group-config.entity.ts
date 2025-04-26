import { AutoMap } from '@automapper/classes';

export type AlertGroupConfig = AlertGroupDiveraCOnfig;

export class BaseAlertGroupConfig {
	@AutoMap()
	alertGroupId: string;
}

export class AlertGroupDiveraCOnfig extends BaseAlertGroupConfig {
	@AutoMap()
	diveraGroupId: string;
}
