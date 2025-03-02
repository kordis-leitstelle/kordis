import { Mapper, createMap, forMember, mapFrom } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { BaseMapperProfile } from '@kordis/api/shared';

import { OperationEntity } from '../../core/entity/operation.entity';
import {
	InvolvementTime,
	OperationAlertGroupInvolvement,
	OperationBaseAddress,
	OperationCategory,
	OperationLocation,
	OperationLocationAddress,
	OperationPatient,
	OperationUnitInvolvement,
} from '../../core/entity/operation.value-objects';
import {
	OperationAggregateModel,
	OperationUnitInvolvement as OperationAggregateUnitInvolvement,
} from '../repository/operation-aggregate.model';
import {
	OperationAddressDocument,
	OperationCategoryDocument,
	OperationLocationDocument,
	OperationPatientDocument,
} from '../schema/operation.schema';

@Injectable()
export class OperationValueObjectsProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, OperationLocationDocument, OperationLocation);
			createMap(mapper, OperationAddressDocument, OperationLocationAddress);
			createMap(mapper, OperationAddressDocument, OperationBaseAddress);
			createMap(mapper, OperationCategoryDocument, OperationCategory);
			createMap(mapper, OperationPatientDocument, OperationPatient);
		};
	}
}

@Injectable()
export class OperationProfile extends BaseMapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				OperationAggregateModel,
				OperationEntity,
				forMember(
					(d) => d.createdByUser,
					mapFrom((s) => ({ id: s.createdByUserId })),
				),
				forMember(
					(d) => d.unitInvolvements,
					mapFrom((s) => this.mapUnitInvolvements(s.unitInvolvements)),
				),
				forMember(
					(d) => d.alertGroupInvolvements,
					mapFrom((s) =>
						s.alertGroupInvolvements.map((ag) =>
							plainToInstance(OperationAlertGroupInvolvement, {
								alertGroup: { id: ag.alertGroupId },
								unitInvolvements: this.mapUnitInvolvements(ag.unitInvolvements),
							}),
						),
					),
				),
			);
		};
	}

	private mapUnitInvolvements(
		involvements: OperationAggregateUnitInvolvement[],
	): OperationUnitInvolvement[] {
		return involvements.map((u) => {
			const involvement = new OperationUnitInvolvement();
			involvement.unit = { id: u.unitId };
			involvement.involvementTimes = u.involvementTimes.map((time) =>
				plainToInstance(InvolvementTime, time),
			);
			involvement.isPending = u.isPending;

			return involvement;
		});
	}
}
