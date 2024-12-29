import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import {
	GetRescueStationDeploymentQuery,
	RescueStationDeploymentViewModel,
} from '@kordis/api/deployment';
import { RescueStationMessageDetails } from '@kordis/api/protocol';
import {
	AlertGroupViewModel,
	GetAlertGroupsByIdsQuery,
	GetUnitsByIdsQuery,
	UnitViewModel,
} from '@kordis/api/unit';

import { CommandRescueStationData } from './command-rescue-station-data.model';

@Injectable()
export class RescueStationMessageDetailsFactory {
	constructor(private readonly queryBus: QueryBus) {}

	async createFromCommandRescueStationData(
		orgId: string,
		commandRescueStationData: CommandRescueStationData,
	): Promise<RescueStationMessageDetails> {
		const rs: RescueStationDeploymentViewModel = await this.queryBus.execute(
			new GetRescueStationDeploymentQuery(
				orgId,
				commandRescueStationData.rescueStationId,
			),
		);

		const { units, alertGroups } = await this.getPopulatedUnitsAndAlertGroups(
			commandRescueStationData,
		);

		return {
			id: rs.id,
			callSign: rs.callSign,
			name: rs.name,
			units,
			alertGroups,
			strength: commandRescueStationData.strength,
		};
	}

	// as units and alert groups are foreign fields the domain query will only return their ids we have to populate them by querying them from their respective domains
	private async getPopulatedUnitsAndAlertGroups(
		rescueStationData: CommandRescueStationData,
	): Promise<{
		units: RescueStationMessageDetails['units'];
		alertGroups: RescueStationMessageDetails['alertGroups'];
	}> {
		const units: UnitViewModel[] = await this.queryBus.execute(
			new GetUnitsByIdsQuery(
				[
					...rescueStationData.assignedUnitIds,
					...rescueStationData.assignedAlertGroups.flatMap(
						(involvement) => involvement.unitIds,
					),
				],
				undefined,
				{ retainOrder: true },
			),
		);

		const commandUnits = units
			.splice(0, rescueStationData.assignedUnitIds.length)
			.map((unit) => ({
				name: unit.name,
				callSign: unit.callSign,
				id: unit.id,
			}));

		const alertGroups: AlertGroupViewModel[] = await this.queryBus.execute(
			new GetAlertGroupsByIdsQuery(
				rescueStationData.assignedAlertGroups.map(
					(involvement) => involvement.alertGroupId,
				),
			),
		);

		const commandAlertGroups = alertGroups.map((value, i) => ({
			id: value.id,
			name: value.name,
			units: units
				.splice(0, rescueStationData.assignedAlertGroups[i].unitIds.length)
				.map((unit) => ({
					id: unit.id,
					name: unit.name,
					callSign: unit.callSign,
				})),
		}));

		return { units: commandUnits, alertGroups: commandAlertGroups };
	}
}
