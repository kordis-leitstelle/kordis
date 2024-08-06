import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import {
	Mutable,
	PresentableNotFoundException,
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';

import { CreateOrganizationCommand } from '../../core/command/create-organization.command';
import { UpdateOrganizationGeoSettingsCommand } from '../../core/command/update-organization-geo-settings.command';
import {
	OrganizationEntity,
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
			const org: Mutable<OrganizationEntity> = new OrganizationEntity();
			org.id = 'testorg';
			org.name = 'testorg';
			org.geoSettings = {
				bbox: {
					bottomRight: { lon: 9.993682, lat: 53.551086 },
					topLeft: { lon: 9.993682, lat: 53.551086 },
				},
				centroid: {
					lon: 9.993682,
					lat: 53.551086,
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
				PresentableNotFoundException,
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
					bottomRight: { lon: 9.993682, lat: 53.551086 },
					topLeft: { lon: 9.993682, lat: 53.551086 },
				},
				centroid: {
					lon: 9.993682,
					lat: 53.551086,
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
			).rejects.toThrow(PresentableNotFoundException);
		});

		it('should throw PresentableValidationException', async () => {
			commandBusMock.execute.mockRejectedValueOnce(new ValidationException([]));
			await expect(
				resolver.updateOrganizationGeoSettings('testorg', null),
			).rejects.toThrow(PresentableValidationException);
		});
	});

	describe('createOrganization', () => {
		it('should dispatch create command', async () => {
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
			await expect(
				resolver.createOrganization('testorg', geoSettings),
			).resolves.toBeTruthy();
			expect(commandBusMock.execute).toHaveBeenCalledWith(
				new CreateOrganizationCommand('testorg', geoSettings),
			);
		});

		it('should throw PresentableValidationException', async () => {
			commandBusMock.execute.mockRejectedValueOnce(new ValidationException([]));
			await expect(
				resolver.createOrganization('testorg', null),
			).rejects.toThrow(PresentableValidationException);
		});
	});
});
