import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdatableEntity, WithId } from '@kordis/api/shared';

import { Organization as OrganizationEntity } from '../../core/entity/organization.entity';
import { OrganizationRepository } from '../../core/repository/organization.repository';
import { OrganizationDocument } from '../schema/organization.schema';

export class ImplOrganizationRepository implements OrganizationRepository {
	constructor(
		@InjectModel(OrganizationDocument.name)
		private readonly organizationModel: Model<OrganizationDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async update(org: UpdatableEntity<OrganizationEntity>): Promise<void> {
		await this.organizationModel
			.updateOne({ _id: org.id }, { $set: org })
			.exec();
	}

	async findById(id: string): Promise<WithId<OrganizationEntity> | null> {
		const orgDoc = await this.organizationModel.findById(id).exec();
		if (!orgDoc) {
			return null;
		}

		const orgEntity = await this.mapper.mapAsync(
			orgDoc.toObject(),
			OrganizationDocument,
			OrganizationEntity,
		);

		return orgEntity as WithId<OrganizationEntity>;
	}
}
