import { AlertGroupEntity } from '../entity/alert-group.entity';

export const ALERT_GROUP_REPOSITORY = Symbol('ALERT_GROUP_REPOSITORY');

export interface AlertGroupRepository {
	findByIds(ids: string[], orgId?: string): Promise<AlertGroupEntity[]>;

	findById(orgId: string, id: string): Promise<AlertGroupEntity>;

	findByOrgId(orgId: string): Promise<AlertGroupEntity[]>;

	updateCurrentUnits(
		orgId: string,
		alertGroupId: string,
		unitIds: string[],
	): Promise<boolean>;

	resetCurrentUnitsToDefaultUnits(orgId: string): Promise<void>;
}
