import type { Organization } from '../entity/organization.entity';

export class OrganizationCreatedEvent {
	constructor(public readonly org: Organization) {}
}
