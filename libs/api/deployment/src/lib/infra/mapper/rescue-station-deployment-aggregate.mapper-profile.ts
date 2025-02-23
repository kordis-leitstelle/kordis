import {
	Mapper,
	MappingConfiguration,
	createMap,
	extend,
	forMember,
	mapFrom,
} from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseMapperProfile, Coordinate } from '@kordis/api/shared';

import { BaseDeploymentEntity } from '../../core/entity/deployment.entity';
import {
	RescueStationAddress as RescueStationAddressValueObject,
	RescueStationDeploymentEntity,
	RescueStationLocation as RescueStationLocationValueObject,
	RescueStationStrength as RescueStationStrengthValueObject,
} from '../../core/entity/rescue-station-deployment.entity';
import { DeploymentAggregate } from '../repository/deployment/abstract-deployment.repository';
import {
	RescueStationAddress,
	RescueStationDeploymentDocument,
	RescueStationLocation,
	RescueStationStrength,
} from '../schema/rescue-station-deployment.schema';

@Injectable()
export class RescueStationDeploymentValueObjectProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationLocation,
				RescueStationLocationValueObject,
			);
			createMap(
				mapper,
				RescueStationLocationValueObject,
				RescueStationLocation,
			);
			createMap(
				mapper,
				RescueStationStrength,
				RescueStationStrengthValueObject,
			);
			createMap(
				mapper,
				RescueStationStrengthValueObject,
				RescueStationStrength,
			);
			createMap(mapper, RescueStationAddress, RescueStationAddressValueObject);
			createMap(mapper, RescueStationAddressValueObject, RescueStationAddress);
			createMap(mapper, Coordinate, Coordinate);
		};
	}
}

@Injectable()
export class RescueStationDeploymentAggregateProfile extends BaseMapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap<RescueStationDeploymentDocument, RescueStationDeploymentEntity>(
				mapper,
				RescueStationDeploymentDocument,
				RescueStationDeploymentEntity,
				forMember(
					(d) => d.defaultUnits,
					mapFrom((s) =>
						s.defaultUnitIds.map((id) => ({
							id,
						})),
					),
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
