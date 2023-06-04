import { createMock } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { WithId } from '@kordis/api/shared';

import {
	Organization,
	OrganizationGeoSettings,
	OrganizationSettings,
} from '../entity/organization.entity';
import { OrganizationGeoSettingsUpdatedEvent } from '../event/organization-geo-settings-updated.event';
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
		const org = new Organization();
		org.id = '123';
		org.name = 'org name';
		org.settings = {
			geo: {} as OrganizationGeoSettings,
		} as OrganizationSettings;

		repositoryMock.findById.mockResolvedValueOnce(org as WithId<Organization>);
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
		expect(result.settings.geo).toEqual(geoSettings);
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
		await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
	});
});
