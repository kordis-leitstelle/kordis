import { UpdatableEntity } from '@kordis/api/shared';

import { Organization } from '../entity/organization.entity';

export const ORGANIZATION_REPOSITORY = Symbol('OrganizationRepository');
export interface OrganizationRepository {
	findById(id: string): Promise<Organization | null>;
	update(org: UpdatableEntity<Organization>): Promise<void>;
}
