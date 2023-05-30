import { createMock } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { Organization } from '../entity/organization.entity';
import {
	ORGANIZATION_REPOSITORY,
	OrganizationRepository,
} from '../repository/organization.repository';
import {
	GetOrganizationHandler,
	GetOrganizationQuery,
} from './get-organization.query';

describe('CreateOrganizationHandler', () => {
	let getOrganizationHandler: GetOrganizationHandler;
	let organizationRepository: OrganizationRepository;

	beforeEach(async () => {
		// Create a mocked OrganizationRepository
		const organizationRepositoryMock = createMock<OrganizationRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				GetOrganizationQuery,
				{
					provide: ORGANIZATION_REPOSITORY,
					useValue: organizationRepositoryMock,
				},
			],
		}).compile();

		getOrganizationHandler = moduleRef.get<GetOrganizationHandler>(
			GetOrganizationHandler,
		);
		organizationRepository = moduleRef.get<OrganizationRepository>(
			ORGANIZATION_REPOSITORY,
		);
	});

	describe('execute', () => {
		it('should return an organization when given a valid id', async () => {
			// Mock the findById method of the organization repository
			const org = new Organization();
			org.id = '123';

			jest.spyOn(organizationRepository, 'findById').mockResolvedValueOnce(org);

			const query = new GetOrganizationQuery('validId');

			const result = await getOrganizationHandler.execute(query);

			expect(result).toEqual(org);
		});

		it('should throw NotFoundException when given an invalid id', async () => {
			jest
				.spyOn(organizationRepository, 'findById')
				.mockResolvedValueOnce(null);

			const query = new GetOrganizationQuery('invalidId');

			await expect(getOrganizationHandler.execute(query)).rejects.toThrow(
				NotFoundException,
			);
		});
	});
});
