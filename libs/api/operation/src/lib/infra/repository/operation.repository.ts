import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Operation } from '../../core/entity/operation.entity';
import { OperationRepository } from '../../core/repository/operation.repository';
import { OperationDocument } from '../schema/operation.schema';

export class OperationRepositoryImpl implements OperationRepository {
	constructor(
		@InjectModel(OperationDocument.name)
		private readonly operationModel: Model<OperationDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async create(operation: Operation): Promise<Operation> {
		const operationDoc = await this.operationModel.create(operation);

		return this.mapper.mapAsync(
			operationDoc.toObject(),
			OperationDocument,
			Operation,
		);
	}

	async getLatestOperationSign(orgId: string): Promise<string | undefined> {
		const operationWithLeadingSign = await this.operationModel
			.findOne({ orgId })
			.select('sign')
			.sort({ sign: -1 })
			.lean()
			.exec();

		return operationWithLeadingSign?.sign;
	}
}
