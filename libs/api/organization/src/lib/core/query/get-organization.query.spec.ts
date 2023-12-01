import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import type { Mutable } from '@kordis/api/shared';

import { Organization } from '../entity/organization.entity';
import { OrganizationNotFoundException } from '../exceptions/organization-not-found.exception';
import type { OrganizationRepository } from '../repository/organization.repository';
import { ORGANIZATION_REPOSITORY } from '../repository/organization.repository';
import {
	GetOrganizationHandler,
	GetOrganizationQuery,
} from './get-organization.query';

describe('CreateOrganizationHandler', () => {
	let getOrganizationHandler: GetOrganizationHandler;
	let organizationRepository: OrganizationRepository;

	beforeEach(async () => {
		const organizationRepositoryMock = createMock<OrganizationRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				GetOrganizationHandler,
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

	it('should return an organization', async () => {
		const org: Mutable<Organization> = new Organization();
		org.id = '123';

		jest.spyOn(organizationRepository, 'findById').mockResolvedValueOnce(org);

		const query = new GetOrganizationQuery('123');

		const result = await getOrganizationHandler.execute(query);

		expect(result).toEqual(org);
	});

	it('should throw OrganizationNotFoundException', async () => {
		jest.spyOn(organizationRepository, 'findById').mockResolvedValueOnce(null);

		const query = new GetOrganizationQuery('invalidId');

		await expect(getOrganizationHandler.execute(query)).rejects.toThrow(
			OrganizationNotFoundException,
		);
	});
});
