import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { Mutable } from '@kordis/api/shared';

import { OrganizationEntity } from '../entity/organization.entity';
import { OrganizationNotFoundException } from '../exceptions/organization-not-found.exception';
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
	let organizationRepository: DeepMocked<OrganizationRepository>;

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
		organizationRepository = moduleRef.get(ORGANIZATION_REPOSITORY);
	});

	it('should return an organization', async () => {
		const org: Mutable<OrganizationEntity> = new OrganizationEntity();
		org.id = '123';

		organizationRepository.findById.mockResolvedValueOnce(org);

		const query = new GetOrganizationQuery('123');

		const result = await getOrganizationHandler.execute(query);

		expect(result).toEqual(org);
	});

	it('should throw OrganizationNotFoundException', async () => {
		organizationRepository.findById.mockResolvedValueOnce(null);

		const query = new GetOrganizationQuery('invalidId');

		await expect(getOrganizationHandler.execute(query)).rejects.toThrow(
			OrganizationNotFoundException,
		);
	});
});
