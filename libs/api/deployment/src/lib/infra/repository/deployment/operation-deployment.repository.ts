import { AutoMap } from '@automapper/classes';
import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DbSessionProvider, runDbOperation } from '@kordis/api/shared';

import { OperationDeploymentEntity } from '../../../core/entity/operation-deplyoment.entity';
import { OperationDeploymentRepository } from '../../../core/repository/operation-deployment.repository';
import { OperationDeploymentDocument } from '../../schema/operation-deployment.schema';
import { DeploymentRepositoryImpl } from './abstract-deployment.repository';

export class OperationDeploymentDocumentDTO
	implements Partial<OperationDeploymentDocument>
{
	@AutoMap()
	operationId: string;
}

export class OperationDeploymentRepositoryImpl
	extends DeploymentRepositoryImpl<
		OperationDeploymentEntity,
		OperationDeploymentEntity,
		OperationDeploymentDocument
	>
	implements OperationDeploymentRepository
{
	constructor(
		@InjectModel(OperationDeploymentDocument.name)
		deploymentModel: Model<OperationDeploymentDocument>,
		@Inject(getMapperToken()) mapper: Mapper,
	) {
		super(
			deploymentModel,
			mapper,
			OperationDeploymentEntity,
			OperationDeploymentDocument,
			OperationDeploymentDocumentDTO,
			OperationDeploymentEntity,
		);
	}

	async findByOperationId(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<OperationDeploymentEntity> {
		const doc = await runDbOperation(
			this.deploymentModel.findOne({ orgId, operationId }).lean(),
			uow,
		);

		return this.mapper.mapAsync(
			doc,
			this.documentTypeValue,
			this.entityTypeValue,
		);
	}

	async create(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<OperationDeploymentEntity> {
		await this.deploymentModel.create(
			[
				{
					orgId,
					operationId,
				},
			],
			{ session: uow?.session },
		);

		const doc = await runDbOperation(
			this.deploymentModel.findOne({ orgId, operationId }).lean(),
			uow,
		);

		return this.mapper.mapAsync(
			doc,
			this.documentTypeValue,
			this.entityTypeValue,
		);
	}
}
