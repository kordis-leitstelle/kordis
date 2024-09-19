import { Injectable, inject } from '@angular/core';
import MiniSearch from 'minisearch';
import { firstValueFrom, map } from 'rxjs';

import {
	AlertGroup,
	DeploymentAlertGroup,
	DeploymentAssignment,
	DeploymentUnit,
	Query,
	Unit,
} from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

const UNIT_FRAGMENT = gql`
	fragment UnitFragment on Unit {
		id
		callSign
		name
		status {
			status
			receivedAt
		}
	}
`;

type SearchableUnit = Unit & { alertGroupId?: string };

@Injectable()
export class DeploymentAssignmentsSearchService {
	private readonly gqlService = inject(GraphqlService);

	private currentIndexedUnits = new Set<string>();
	private currentIndexedAlertGroups = new Map<string, string[]>(); // keep alert group units indexed by alert group id to show them if we have a alert group match but no unit matches

	private readonly unitSearchEngine = new MiniSearch<SearchableUnit>({
		fields: ['name', 'callSign', 'callSignAbbreviation'],
		storeFields: ['alertGroupId'],
	});
	private readonly alertGroupSearchEngine = new MiniSearch({
		fields: ['name'],
	});

	updateAssignments(assignments: DeploymentAssignment[]): void {
		const newIndexedUnits = new Set<string>();
		const newIndexedAlertGroups = new Map<string, string[]>();

		// check new assignments for any newly added assignments
		this.indexNewAssignments(
			assignments,
			newIndexedUnits,
			newIndexedAlertGroups,
		);
		// Remove old assignments that are no longer present
		this.removeNonPresentAssignments(newIndexedUnits, newIndexedAlertGroups);

		this.currentIndexedUnits = newIndexedUnits;
		this.currentIndexedAlertGroups = newIndexedAlertGroups;
	}

	/*
	 * Searches for Units and Alert Groups, that have been indexed by `updateAssignments`.
	 * If a unit is found which is assigned to an alert group, the alert group will show only with matching units.
	 * If an alert group is found, it will show all assigned units, but only if there has not been a unit match.
	 */
	async search(
		query: string,
	): Promise<(DeploymentUnit | DeploymentAlertGroup)[]> {
		const unitsResult = this.unitSearchEngine.search(query, {
			prefix: true,
			combineWith: 'AND',
		});
		const alertGroupsResult = this.alertGroupSearchEngine.search(query, {
			prefix: true,
			combineWith: 'AND',
		});

		const alertGroups = new Map<string, DeploymentAlertGroup>();
		const standAloneUnits = [];

		// populate units, if they are assigned to an alert group, add them to the alert group which first will be populated
		for (const r of unitsResult) {
			const unit = await this.populateUnit(r.id);
			if (r.alertGroupId) {
				await this.addUnitToAlertGroup(alertGroups, r.alertGroupId, unit);
			} else {
				standAloneUnits.push({
					__typename: 'DeploymentUnit' as const,
					unit,
				});
			}
		}

		// populate missing alert groups that have not been added yet
		for (const r of alertGroupsResult) {
			if (!alertGroups.has(r.id)) {
				await this.setAlertGroup(r.id, alertGroups, unitsResult.length > 0);
			}
		}

		return [...standAloneUnits, ...alertGroups.values()];
	}

	private indexNewAssignments(
		assignments: DeploymentAssignment[],
		newIndexedUnits: Set<string>,
		newIndexedAlertGroups: Map<string, string[]>,
	): void {
		for (const assignment of assignments) {
			if (assignment.__typename === 'DeploymentUnit') {
				this.indexUnit(assignment.unit, newIndexedUnits);
			} else if (assignment.__typename === 'DeploymentAlertGroup') {
				this.indexAlertGroup(
					assignment,
					newIndexedUnits,
					newIndexedAlertGroups,
				);
			}
		}
	}

	private indexUnit(unit: SearchableUnit, newIndexedUnits: Set<string>): void {
		newIndexedUnits.add(unit.id);
		if (!this.unitSearchEngine.has(unit.id)) {
			this.unitSearchEngine.add(unit);
		}
	}

	private indexAlertGroup(
		assignment: DeploymentAlertGroup,
		newIndexedUnits: Set<string>,
		newIndexedAlertGroups: Map<string, string[]>,
	): void {
		newIndexedAlertGroups.set(assignment.alertGroup.id, []);
		// index the alert group itself
		if (!this.alertGroupSearchEngine.has(assignment.alertGroup.id)) {
			this.alertGroupSearchEngine.add(assignment.alertGroup);
		}

		// index assigned units of the alert group
		for (const { unit } of assignment.assignedUnits) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			newIndexedAlertGroups.get(assignment.alertGroup.id)!.push(unit.id);
			this.indexUnit(
				{
					...unit,
					alertGroupId: assignment.alertGroup.id,
				},
				newIndexedUnits,
			);
		}
	}

	private removeNonPresentAssignments(
		newIndexedUnits: Set<string>,
		newIndexedAlertGroups: Map<string, string[]>,
	): void {
		// for each ID that is not present in the new assignments, discard it from the search index
		for (const id of this.currentIndexedUnits) {
			if (!newIndexedUnits.has(id)) {
				this.unitSearchEngine.discard(id);
			}
		}

		for (const [id] of this.currentIndexedAlertGroups) {
			if (!newIndexedAlertGroups.has(id)) {
				this.alertGroupSearchEngine.discard(id);
			}
		}
	}

	private async setAlertGroup(
		alertGroupId: string,
		alertGroups: Map<string, DeploymentAlertGroup>,
		hasFoundUnits: boolean,
	): Promise<void> {
		const alertGroup = await this.populateAlertGroup(alertGroupId);

		// if units have been found, we will there is a match of units AND this alert group, therefor do not show assigned units unless we have found only alert groups
		const assignedUnits = hasFoundUnits
			? []
			: await this.populateAssignedAlertGroupUnits(alertGroupId);

		alertGroups.set(alertGroupId, {
			__typename: 'DeploymentAlertGroup' as const,
			alertGroup,
			assignedUnits,
		});
	}

	/*
	 * Adds unit to an alert group.
	 * If the alert group has not been populated, it will be added t the alert groups map.
	 */
	private async addUnitToAlertGroup(
		alertGroups: Map<string, DeploymentAlertGroup>,
		alertGroupId: string,
		unit: Unit,
	): Promise<void> {
		// if the unit is assigned to an alert group, add it to the alert group
		if (!alertGroups.has(alertGroupId)) {
			// if the alert has not been added yet, add it
			alertGroups.set(alertGroupId, {
				__typename: 'DeploymentAlertGroup' as const,
				alertGroup: await this.populateAlertGroup(alertGroupId),
				assignedUnits: [],
			});
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		alertGroups.get(alertGroupId)!.assignedUnits.push({
			__typename: 'DeploymentUnit' as const,
			unit,
		});
	}

	private async populateAssignedAlertGroupUnits(
		alertGroupId: string,
	): Promise<DeploymentUnit[]> {
		const populatedAssignedUnits = await Promise.all(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.currentIndexedAlertGroups
				.get(alertGroupId)!
				.map((id) => this.populateUnit(id)),
		);

		return populatedAssignedUnits.map((unit) => ({
			__typename: 'DeploymentUnit' as const,
			unit,
		})) as DeploymentUnit[];
	}

	private populateAlertGroup(id: string): Promise<AlertGroup> {
		return firstValueFrom(
			this.gqlService
				.queryOnce$<{ alertGroup: Query['alertGroup'] }>(
					gql`
						${UNIT_FRAGMENT}
						query GetAlertGroupById($id: ID!) {
							alertGroup(id: $id) {
								id
								name
								currentUnitsOfAssignment {
									unit {
										...UnitFragment
									}
								}
							}
						}
					`,
					{
						id,
					},
				)
				.pipe(map(({ alertGroup }) => alertGroup)),
		);
	}

	private populateUnit(id: string): Promise<Unit> {
		return firstValueFrom(
			this.gqlService
				.queryOnce$<{ unit: Query['unit'] }>(
					gql`
						${UNIT_FRAGMENT}
						query GetUnitById($id: ID!) {
							unit(id: $id) {
								...UnitFragment
							}
						}
					`,
					{
						id,
					},
				)
				.pipe(map(({ unit }) => unit)),
		);
	}
}
