import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { NotFoundException, WithId } from '@kordis/api/shared';

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
		const org = new Organization();
		org.id = '123';

		jest
			.spyOn(organizationRepository, 'findById')
			.mockResolvedValueOnce(org as WithId<Organization>);

		const query = new GetOrganizationQuery('123');

		const result = await getOrganizationHandler.execute(query);

		expect(result).toEqual(org);
	});

	it('should throw NotFoundException', async () => {
		jest.spyOn(organizationRepository, 'findById').mockResolvedValueOnce(null);

		const query = new GetOrganizationQuery('invalidId');

		await expect(getOrganizationHandler.execute(query)).rejects.toThrow(
			NotFoundException,
		);
	});
});
