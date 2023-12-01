import type { Mapper } from '@automapper/core';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getMapperToken } from '@timonmasberg/automapper-nestjs';
import type { Model } from 'mongoose';

import type { Organization } from '../../core/entity/organization.entity';
import { Organization as OrganizationEntity } from '../../core/entity/organization.entity';
import type { OrganizationRepository } from '../../core/repository/organization.repository';
import { OrganizationDocument } from '../schema/organization.schema';

export class ImplOrganizationRepository implements OrganizationRepository {
	constructor(
		@InjectModel(OrganizationDocument.name)
		private readonly organizationModel: Model<OrganizationDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async create(org: Organization): Promise<Organization> {
		const orgDoc = await this.organizationModel.create(org);

		return this.mapper.mapAsync(
			orgDoc.toObject(),
			OrganizationDocument,
			OrganizationEntity,
		);
	}

	async update(org: OrganizationEntity): Promise<void> {
		await this.organizationModel
			.updateOne({ _id: org.id }, { $set: org })
			.exec();
	}

	async findById(id: string): Promise<OrganizationEntity | null> {
		const orgDoc = await this.organizationModel.findById(id).exec();
		if (!orgDoc) {
			return null;
		}

		return this.mapper.mapAsync(
			orgDoc.toObject(),
			OrganizationDocument,
			OrganizationEntity,
		);
	}
}
