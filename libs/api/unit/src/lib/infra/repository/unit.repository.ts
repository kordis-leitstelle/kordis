import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UnitEntity, UnitStatus } from '../../core/entity/unit.entity';
import { UnitNotFoundException } from '../../core/exception/unit-not-found.exception';
import { UnitRepository } from '../../core/repository/unit.repository';
import { UnitDocument } from '../schema/unit.schema';

export class UnitRepositoryImpl implements UnitRepository {
	constructor(
		@InjectModel(UnitDocument.name)
		private readonly unitModel: Model<UnitDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async findByIds(ids: string[]): Promise<UnitEntity[]> {
		const units = await this.unitModel
			.find({ _id: { $in: ids } })
			.lean()
			.exec();

		return this.mapper.mapArrayAsync(units, UnitDocument, UnitEntity);
	}

	async findById(orgId: string, id: string): Promise<UnitEntity> {
		const unit = await this.unitModel.findOne({ _id: id, orgId }).lean().exec();

		if (!unit) {
			throw new UnitNotFoundException();
		}

		return this.mapper.mapAsync(unit, UnitDocument, UnitEntity);
	}

	async findByOrg(orgId: string): Promise<UnitEntity[]> {
		const units = await this.unitModel.find({ orgId }).lean().exec();

		return this.mapper.mapArrayAsync(units, UnitDocument, UnitEntity);
	}

	async findByRcsId(orgId: string, rcsId: string): Promise<UnitEntity> {
		const unit = await this.unitModel.findOne({ orgId, rcsId }).lean().exec();

		if (!unit) {
			throw new UnitNotFoundException();
		}

		return this.mapper.mapAsync(unit, UnitDocument, UnitEntity);
	}

	async updateNote(orgId: string, id: string, note: string): Promise<boolean> {
		const res = await this.unitModel.updateOne(
			{ _id: id, orgId },
			{ $set: { note } },
		);
		return res.modifiedCount > 0;
	}

	async updateStatus(
		orgId: string,
		id: string,
		status: UnitStatus,
	): Promise<boolean> {
		const res = await this.unitModel.updateOne(
			{
				_id: id,
				orgId,
				$or: [
					// we only want to update if the new status is newer than the current one
					{ 'status.receivedAt': { $lt: status.receivedAt } },
					{ status: null },
				],
			},
			{ $set: { status } },
		);

		return res.modifiedCount > 0;
	}
}
