import { Organization } from '../entity/organization.entity';

export const ORGANIZATION_REPOSITORY = Symbol('OrganizationRepository');

export interface OrganizationRepository {
	findById(id: string): Promise<Organization | null>;

	create(org: Organization): Promise<Organization>;

	update(org: Organization): Promise<void>;
}
