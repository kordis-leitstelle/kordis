import { AutoMap } from '@automapper/classes';
import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DbSessionProvider, runDbOperation } from '@kordis/api/shared';

import { RescueStationDeploymentEntity } from '../../../core/entity/rescue-station-deployment.entity';
import {
	RescueStationDeploymentRepository,
	RescueStationEntityDTO,
} from '../../../core/repository/rescue-station-deployment.repository';
import {
	RescueStationDeploymentDocument,
	RescueStationLocation,
	RescueStationStrength,
} from '../../schema/rescue-station-deployment.schema';
import { DeploymentRepositoryImpl } from './abstract-deployment.repository';

// this dto is mostly for mapper purposes, as we cannot map from a document to an entity directly (initializing a mongoose document would fail)
export class RescueStationDocumentDTO
	implements Partial<RescueStationDeploymentDocument>
{
	@AutoMap()
	note: string;
	@AutoMap()
	strength: RescueStationStrength;
	@AutoMap()
	signedIn: boolean;
	@AutoMap()
	location: RescueStationLocation;
	@AutoMap()
	defaultUnitIds: string[];
}

export class RescueStationDeploymentRepositoryImpl
	extends DeploymentRepositoryImpl<
		RescueStationDeploymentEntity,
		RescueStationEntityDTO,
		RescueStationDeploymentDocument
	>
	implements RescueStationDeploymentRepository
{
	constructor(
		@InjectModel(RescueStationDeploymentDocument.name)
		deploymentModel: Model<RescueStationDeploymentDocument>,
		@Inject(getMapperToken()) mapper: Mapper,
	) {
		super(
			deploymentModel,
			mapper,
			RescueStationDeploymentEntity,
			RescueStationDeploymentDocument,
			RescueStationDocumentDTO,
			RescueStationEntityDTO,
		);
	}

	async updateAll(
		orgId: string,
		data: Partial<RescueStationEntityDTO>,
		uow?: DbSessionProvider,
	): Promise<void> {
		const query = this.deploymentModel.updateMany(
			{ orgId },
			{
				$set: data,
			},
		);
		await runDbOperation(query, uow);
	}
}
