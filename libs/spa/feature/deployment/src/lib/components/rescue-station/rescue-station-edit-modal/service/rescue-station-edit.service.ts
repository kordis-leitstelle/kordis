import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
	BaseCreateMessageInput,
	Mutation,
	MutationSignInRescueStationArgs,
	Unit,
} from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { AlertGroupAssignment } from '../component/alert-group-assignment.model';

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
		protocolMessageData: BaseCreateMessageInput | null,
	): Observable<void> {
		return this.gqlService
			.mutate$<{ signInRescueStation: Mutation['signInRescueStation'] }>(
				gql`
					mutation (
						$rescueStationData: UpdateRescueStationInput!
						$protocolMessageData: BaseCreateMessageInput
					) {
						signInRescueStation(
							rescueStationData: $rescueStationData
							protocolMessage: $protocolMessageData
						) {
							id
						}
					}
				`,
				{
					rescueStationData: this.rescueStationDataToArgs(rescueStationData),
					protocolMessageData,
				},
			)
			.pipe(map(() => undefined));
	}

	update$(
		rescueStationData: RescueStationData,
		protocolMessageData: BaseCreateMessageInput | null,
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
							protocolMessage: $protocolMessageData
						) {
							id
						}
					}
				`,
				{
					rescueStationData: this.rescueStationDataToArgs(rescueStationData),
					protocolMessageData,
				},
			)
			.pipe(map(() => undefined));
	}

	signOff$(
		rescueStationId: string,
		protocolMessageData: BaseCreateMessageInput | null,
	): Observable<void> {
		return this.gqlService
			.mutate$(
				gql`
					mutation (
						$rescueStationId: String!
						$protocolMessageData: BaseCreateMessageInput
					) {
						signOffRescueStation(
							protocolMessage: $protocolMessageData
							rescueStationId: $rescueStationId
						) {
							id
							signedIn
						}
					}
				`,
				{
					rescueStationId,
					protocolMessageData,
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
}
