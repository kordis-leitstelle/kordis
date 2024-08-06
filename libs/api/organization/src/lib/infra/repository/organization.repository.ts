import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OrganizationEntity } from '../../core/entity/organization.entity';
import { OrganizationRepository } from '../../core/repository/organization.repository';
import { OrganizationDocument } from '../schema/organization.schema';

export class ImplOrganizationRepository implements OrganizationRepository {
	constructor(
		@InjectModel(OrganizationDocument.name)
		private readonly organizationModel: Model<OrganizationDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async create(org: OrganizationEntity): Promise<OrganizationEntity> {
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
		const orgDoc = await this.organizationModel.findById(id).lean().exec();

		if (!orgDoc) {
			return null;
		}

		return this.mapper.mapAsync(
			orgDoc,
			OrganizationDocument,
			OrganizationEntity,
		);
	}
}
