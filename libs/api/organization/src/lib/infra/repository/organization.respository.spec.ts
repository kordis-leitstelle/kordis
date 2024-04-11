import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Mutable, SharedKernel } from '@kordis/api/shared';
import { mockModelMethodResult } from '@kordis/api/test-helpers';

import { Organization as OrganizationEntity } from '../../core/entity/organization.entity';
import { OrganizationProfile } from '../organization.mapper-profile';
import { OrganizationDocument } from '../schema/organization.schema';
import { ImplOrganizationRepository } from './organization.repository';

describe('ImplOrganizationRepository', () => {
	let repository: ImplOrganizationRepository;
	let organizationModel: Model<OrganizationDocument>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				SharedKernel,
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				ImplOrganizationRepository,
				OrganizationProfile,
				{
					provide: getModelToken(OrganizationDocument.name),
					useValue: createMock<Model<OrganizationDocument>>(),
				},
			],
		}).compile();

		repository = moduleRef.get<ImplOrganizationRepository>(
			ImplOrganizationRepository,
		);
		organizationModel = moduleRef.get<Model<OrganizationDocument>>(
			getModelToken(OrganizationDocument.name),
		);
	});

	describe('update', () => {
		it('should update the organization', async () => {
			const org: Mutable<OrganizationEntity> = new OrganizationEntity();
			org.id = 'org-id';
			org.name = 'org-name';
			const updateOneSpy = jest.spyOn(organizationModel, 'updateOne');

			await repository.update(org);

			expect(updateOneSpy).toHaveBeenCalledWith({ _id: org.id }, { $set: org });
		});
	});

	describe('findById', () => {
		it('should return mapped organization entity', async () => {
			const orgId = 'org-id';
			const orgName = 'org-name';
			const geoSettings = {
				bbox: {
					bottomRight: { lon: 9.993682, lat: 53.551086 },
					topLeft: { lon: 9.993682, lat: 53.551086 },
				},
				centroid: {
					lon: 9.993682,
					lat: 53.551086,
				},
			};
			const createdAt = new Date();
			const updatedAt = new Date();

			const orgDoc: Mutable<DeepMocked<OrganizationDocument>> =
				createMock<OrganizationDocument>();
			orgDoc._id = orgId;
			orgDoc.orgId = orgId;
			orgDoc.name = orgName;
			orgDoc.geoSettings = geoSettings;
			orgDoc.createdAt = createdAt;
			orgDoc.updatedAt = updatedAt;

			const mappedOrg: Mutable<OrganizationEntity> = new OrganizationEntity();
			mappedOrg.id = orgId;
			mappedOrg.orgId = orgId;
			mappedOrg.name = orgName;
			mappedOrg.geoSettings = geoSettings;
			mappedOrg.createdAt = createdAt;
			mappedOrg.updatedAt = updatedAt;

			mockModelMethodResult(organizationModel, orgDoc, 'findById');

			const result = await repository.findById(orgId);

			expect(result).toStrictEqual<OrganizationEntity>(mappedOrg);
		});

		it('should return null if organization is not found', async () => {
			mockModelMethodResult(organizationModel, null, 'findById');

			const result = await repository.findById('unknown-org-id');

			expect(result).toBeNull();
		});
	});
});
