import { UpdatableEntity, WithId } from '@kordis/api/shared';

import { Organization } from '../entity/organization.entity';

export const ORGANIZATION_REPOSITORY = Symbol('OrganizationRepository');
export interface OrganizationRepository {
	findById(id: string): Promise<WithId<Organization> | null>;
	update(org: UpdatableEntity<Organization>): Promise<void>;
}
