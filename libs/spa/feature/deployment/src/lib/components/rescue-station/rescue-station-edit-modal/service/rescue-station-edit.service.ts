import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
	Mutation,
	MutationSignInRescueStationArgs,
	Unit,
	UnitInput,
} from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { AlertGroupAssignment } from '../component/alert-group-assignment.model';

export interface ProtocolMessageData {
	sender: Unit | string;
	recipient: Unit | string;
	channel: string;
}

export interface RescueStationData {
	rescueStationId: string;
	strength: {
		leaders: number;
		subLeaders: number;
		helpers: number;
	};
	note: string;
	assignedUnits: Unit[];
	assignedAlertGroups: AlertGroupAssignment[];
}

@Injectable({
	providedIn: 'root',
})
export class RescueStationEditService {
	private readonly gqlService = inject(GraphqlService);

	signIn$(
		rescueStationData: RescueStationData,
		protocolMessageData: ProtocolMessageData,
	): Observable<void> {
		return this.gqlService
			.mutate$<{ signInRescueStation: Mutation['signInRescueStation'] }>(
				gql`
					mutation (
						$rescueStationData: UpdateRescueStationInput!
						$protocolMessageData: BaseCreateMessageInput!
					) {
						signInRescueStation(
							rescueStationData: $rescueStationData
							protocolMessageData: $protocolMessageData
						) {
							id
						}
					}
				`,
				{
					rescueStationData: this.rescueStationDataToArgs(rescueStationData),
					protocolMessageData: this.protocolDataToArgs(protocolMessageData),
				},
			)
			.pipe(map(() => undefined));
	}

	update$(
		rescueStationData: RescueStationData,
		protocolMessageData?: ProtocolMessageData,
	): Observable<void> {
		return this.gqlService
			.mutate$(
				gql`
					mutation (
						$rescueStationData: UpdateRescueStationInput!
						$protocolMessageData: BaseCreateMessageInput
					) {
						updateSignedInRescueStation(
							rescueStationData: $rescueStationData
							protocolMessageData: $protocolMessageData
						) {
							id
						}
					}
				`,
				{
					rescueStationData: this.rescueStationDataToArgs(rescueStationData),
					protocolMessageData: protocolMessageData
						? this.protocolDataToArgs(protocolMessageData)
						: null,
				},
			)
			.pipe(map(() => undefined));
	}

	signOff$(
		rescueStationId: string,
		protocolMessageData: ProtocolMessageData,
	): Observable<void> {
		return this.gqlService
			.mutate$(
				gql`
					mutation (
						$rescueStationId: String!
						$protocolMessageData: BaseCreateMessageInput!
					) {
						signOffRescueStation(
							protocolMessageData: $protocolMessageData
							rescueStationId: $rescueStationId
						) {
							id
							signedIn
						}
					}
				`,
				{
					rescueStationId,
					protocolMessageData: this.protocolDataToArgs(protocolMessageData),
				},
			)
			.pipe(map(() => undefined));
	}

	private rescueStationDataToArgs(
		payload: RescueStationData,
	): MutationSignInRescueStationArgs['rescueStationData'] {
		return {
			rescueStationId: payload.rescueStationId,
			strength: payload.strength,
			note: payload.note,
			assignedUnitIds: payload.assignedUnits.map((unit) => unit.id),
			assignedAlertGroups: payload.assignedAlertGroups.map((assignment) => ({
				alertGroupId: assignment.alertGroup.id,
				unitIds: assignment.assignedUnits.map((unit) => unit.id),
			})),
		};
	}

	private protocolDataToArgs(
		payload: ProtocolMessageData,
	): MutationSignInRescueStationArgs['protocolMessageData'] {
		return {
			...payload,
			sender: this.unitToUnitInput(payload.sender),
			recipient: this.unitToUnitInput(payload.recipient),
		};
	}

	private unitToUnitInput(unit: Unit | string): UnitInput {
		return typeof unit === 'string'
			? { name: unit, type: 'UNKNOWN_UNIT' }
			: { id: unit.id, type: 'REGISTERED_UNIT' };
	}
}
