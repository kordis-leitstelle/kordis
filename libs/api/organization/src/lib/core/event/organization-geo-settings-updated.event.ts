import { OrganizationGeoSettings } from '../entity/organization.entity';

export class OrganizationGeoSettingsUpdatedEvent {
	constructor(
		public readonly orgId: string,
		public readonly geoSettings: OrganizationGeoSettings,
	) {}
}
