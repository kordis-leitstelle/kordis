import { AlertGroupEntity } from '../entity/alert-group.entity';

export const ALERT_GROUP_REPOSITORY = Symbol('ALERT_GROUP_REPOSITORY');

export interface AlertGroupRepository {
	findByIds(ids: string[]): Promise<AlertGroupEntity[]>;

	findById(orgId: string, id: string): Promise<AlertGroupEntity>;

	findByOrgId(orgId: string): Promise<AlertGroupEntity[]>;
}
