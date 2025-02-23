import {
	Mapper,
	MappingConfiguration,
	createMap,
	extend,
	forMember,
	mapFrom,
} from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseMapperProfile } from '@kordis/api/shared';

import { BaseDeploymentEntity } from '../../core/entity/deployment.entity';
import { OperationDeploymentEntity } from '../../core/entity/operation-deplyoment.entity';
import { DeploymentAggregate } from '../repository/deployment/abstract-deployment.repository';
import { OperationDeploymentDocument } from '../schema/operation-deployment.schema';

@Injectable()
export class OperationDeploymentAggregateProfile extends BaseMapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap<OperationDeploymentDocument, OperationDeploymentEntity>(
				mapper,
				OperationDeploymentDocument,
				OperationDeploymentEntity,
				forMember(
					(d) => d.operation,
					mapFrom((s) => ({
						id: s.operationId,
					})),
				),
			);
		};
	}

	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			...super.mappingConfigurations,
			extend(DeploymentAggregate, BaseDeploymentEntity),
		];
	}
}
