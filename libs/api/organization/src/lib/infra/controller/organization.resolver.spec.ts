import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import {
	NotFoundException,
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';

import { UpdateOrganizationGeoSettingsCommand } from '../../core/command/update-organization-geo-settings.command';
import {
	Organization,
	OrganizationGeoSettings,
} from '../../core/entity/organization.entity';
import { OrganizationNotFoundException } from '../../core/exceptions/organization-not-found.exception';
import { OrganizationResolver } from './organization.resolver';

describe('OrganizationResolver', () => {
	let resolver: OrganizationResolver;
	let queryBusMock: DeepMocked<QueryBus>;
	let commandBusMock: DeepMocked<CommandBus>;

	beforeEach(async () => {
		queryBusMock = createMock<QueryBus>();
		commandBusMock = createMock<CommandBus>();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OrganizationResolver,
				{
					provide: QueryBus,
					useValue: queryBusMock,
				},
				{
					provide: CommandBus,
					useValue: commandBusMock,
				},
			],
		}).compile();

		resolver = module.get<OrganizationResolver>(OrganizationResolver);
	});

	describe('organization', () => {
		it('should resolve organization', async () => {
			const org = new Organization();
			org.id = 'testorg';
			org.name = 'testorg';
			org.settings = {
				geo: {
					bbox: {
						bottomRight: { lon: 12, lat: 34 },
						topLeft: { lon: 12, lat: 34 },
					},
					centroid: {
						lon: 12,
						lat: 34,
					},
				},
			};

			queryBusMock.execute.mockResolvedValueOnce(org);

			await expect(resolver.organization('testorg')).resolves.toEqual(org);
		});

		it('should throw NotFoundException', async () => {
			queryBusMock.execute.mockRejectedValueOnce(
				new OrganizationNotFoundException('testorg'),
			);
			await expect(resolver.organization('testorg')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('updateOrganizationGeoSettings', () => {
		it('should dispatch update command', async () => {
			queryBusMock.execute.mockRejectedValueOnce(
				new OrganizationNotFoundException('testorg'),
			);
			const geoSettings: OrganizationGeoSettings = {
				bbox: {
					bottomRight: { lon: 12, lat: 34 },
					topLeft: { lon: 12, lat: 34 },
				},
				centroid: {
					lon: 12,
					lat: 34,
				},
			};
			await expect(
				resolver.updateOrganizationGeoSettings('testorg', geoSettings),
			).resolves.toBeTruthy();
			expect(commandBusMock.execute).toHaveBeenCalledWith(
				new UpdateOrganizationGeoSettingsCommand('testorg', geoSettings),
			);
		});

		it('should throw NotFoundException', async () => {
			commandBusMock.execute.mockRejectedValueOnce(
				new OrganizationNotFoundException('testorg'),
			);
			await expect(
				resolver.updateOrganizationGeoSettings('testorg', null),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw PresentableValidationException', async () => {
			commandBusMock.execute.mockRejectedValueOnce(new ValidationException([]));
			await expect(
				resolver.updateOrganizationGeoSettings('testorg', null),
			).rejects.toThrow(PresentableValidationException);
		});
	});
});
