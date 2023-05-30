import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdatableEntity } from '@kordis/api/shared';

import { Organization as OrganizationEntity } from '../../core/entity/organization.entity';
import { OrganizationRepository } from '../../core/repository/organization.repository';
import {
	Organization,
	Organization as OrganizationSchema,
} from '../schema/organization.schema';

export class ImplOrganizationRepository implements OrganizationRepository {
	constructor(
		@InjectModel(OrganizationEntity.name)
		private organizationModel: Model<Organization>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async update(org: UpdatableEntity<OrganizationEntity>): Promise<void> {
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
			OrganizationSchema,
			OrganizationEntity,
		);
	}
}
