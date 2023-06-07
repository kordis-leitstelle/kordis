import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';

import { PresentableNotFoundException } from '@kordis/api/shared';

import {
	Organization,
	OrganizationGeoSettings,
} from '../entity/organization.entity';
import { OrganizationGeoSettingsUpdatedEvent } from '../event/organization-geo-settings-updated.event';
import { OrganizationNotFoundException } from '../exceptions/organization-not-found.exception';
import { OrganizationRepository } from '../repository/organization.repository';
import {
	UpdateOrganizationGeoSettingsCommand,
	UpdateOrganizationGeoSettingsHandler,
} from './update-organization-geo-settings.command';

describe('UpdateOrganizationGeoSettingsHandler', () => {
	let handler: UpdateOrganizationGeoSettingsHandler;
	const repositoryMock = createMock<OrganizationRepository>();
	const eventBusMock = createMock<EventBus>();

	beforeEach(() => {
		handler = new UpdateOrganizationGeoSettingsHandler(
			repositoryMock,
			eventBusMock,
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should update organization geo settings and publish an event', async () => {
		const orgId = 'org-id';
		const geoSettings: OrganizationGeoSettings = {
			bbox: {
				bottomRight: { lon: 12, lat: 53.551086 },
				topLeft: { lon: 12, lat: 53.551086 },
			},
			centroid: {
				lon: 12,
				lat: 53.551086,
			},
		};
		const org: { -readonly [K in keyof Organization]: Organization[K] } =
			new Organization();
		org.id = orgId;
		org.name = 'org name';
		org.geoSettings = {} as OrganizationGeoSettings;

		repositoryMock.findById.mockResolvedValueOnce(org);
		repositoryMock.update.mockResolvedValueOnce(undefined);

		const eventPublishSpy = jest.spyOn(eventBusMock, 'publish');

		const command = new UpdateOrganizationGeoSettingsCommand(
			orgId,
			geoSettings,
		);
		const result = await handler.execute(command);

		expect(repositoryMock.findById).toHaveBeenCalledWith(orgId);
		expect(eventPublishSpy).toHaveBeenCalledWith(
			new OrganizationGeoSettingsUpdatedEvent(org.id, geoSettings),
		);
		expect(result.geoSettings).toEqual(geoSettings);
	});

	it('should throw NotFoundException if organization is not found', async () => {
		const orgId = 'org-id';
		const geoSettings: OrganizationGeoSettings = {
			bbox: {
				bottomRight: { lon: 9.993682, lat: 53.551086 },
				topLeft: { lon: 9.993682, lat: 53.551086 },
			},
			centroid: {
				lon: 9.993682,
				lat: 53.551086,
			},
		};
		repositoryMock.findById.mockResolvedValueOnce(null);

		const command = new UpdateOrganizationGeoSettingsCommand(
			orgId,
			geoSettings,
		);
		await expect(handler.execute(command)).rejects.toThrow(
			OrganizationNotFoundException,
		);
	});
});
