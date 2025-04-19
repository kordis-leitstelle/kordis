import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import {
	Mutable,
	SharedKernel,
	UNIT_OF_WORK_SERVICE,
} from '@kordis/api/shared';
import { mockModelMethodResult } from '@kordis/api/test-helpers';

import { OrganizationEntity } from '../../core/entity/organization.entity';
import {
	OrganizationProfile,
	OrganizationValueObjectsProfile,
} from '../organization.mapper-profile';
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
				OrganizationValueObjectsProfile,
				{
					provide: getModelToken(OrganizationDocument.name),
					useValue: createMock<Model<OrganizationDocument>>(),
				},
			],
		})
			.overrideProvider(UNIT_OF_WORK_SERVICE)
			.useValue(null)
			.compile();

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
			const orgId = new Types.ObjectId().toString();
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
				mapLayers: [],
				mapStyles: {
					streetUrl: 'street',
					satelliteUrl: 'satellite',
					darkUrl: 'dark',
				},
			};
			const createdAt = new Date();
			const updatedAt = new Date();

			const orgDoc: Mutable<OrganizationDocument> = {} as OrganizationDocument;
			orgDoc._id = new Types.ObjectId(orgId);
			orgDoc.orgId = orgId;
			orgDoc.name = orgName;
			orgDoc.geoSettings = geoSettings;
			orgDoc.createdAt = createdAt;
			orgDoc.updatedAt = updatedAt;

			const mappedOrg: Mutable<OrganizationEntity> = plainToInstance(
				OrganizationEntity,
				{
					id: orgId,
					orgId: orgId,
					name: orgName,
					geoSettings: {
						bbox: geoSettings.bbox,
						centroid: geoSettings.centroid,
						mapLayers: geoSettings.mapLayers,
						mapStyles: geoSettings.mapStyles,
					},
					createdAt: createdAt,
					updatedAt: updatedAt,
				},
			);

			mockModelMethodResult(organizationModel, orgDoc, 'findById');

			const result = await repository.findById(orgId);

			expect(result).toEqual(mappedOrg);
		});

		it('should return null if organization is not found', async () => {
			mockModelMethodResult(organizationModel, null, 'findById');

			const result = await repository.findById('unknown-org-id');

			expect(result).toBeNull();
		});
	});
});
