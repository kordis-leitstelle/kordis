import { Injectable, inject } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';
import { firstValueFrom, map } from 'rxjs';

import { Query, Unit } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import {
	AbstractEntitySearchService,
	EntitySearchService,
	SearchEntityProvider,
} from '../../../../services/entity-search.service';
import { EntitySelectionSearchService } from './entity-selection-search.service';

@Injectable({
	providedIn: 'root',
})
class SelectableUnitsProvider implements SearchEntityProvider<Unit> {
	private readonly gqlService = inject(GraphqlService);

	provideByIds(ids: string[]): Promise<Unit[]> {
		return firstValueFrom(
			this.gqlService
				.queryOnce$<{ units: Query['units'] }>(
					gql`
						query GetUnitsByIds($ids: [ID!]!) {
							units(filter: { ids: $ids }) {
								id
								callSign
								callSignAbbreviation
								name
								status {
									status
								}
								assignment {
									__typename
									name
								}
							}
						}
					`,
					{
						ids,
					},
				)
				.pipe(map(({ units }) => units)),
		);
	}

	provideInitial(): Promise<Unit[]> {
		return firstValueFrom(
			this.gqlService
				.queryOnce$<{ units: Query['units'] }>(gql`
					query GetUnits {
						units {
							id
							callSign
							callSignAbbreviation
							name
							status {
								status
							}
							assignment {
								__typename
								name
							}
						}
					}
				`)
				.pipe(map(({ units }) => units)),
		);
	}
}

@Injectable({
	providedIn: 'root',
})
class SelectableUnitSearchService extends AbstractEntitySearchService<Unit> {
	constructor(unitSearchEntityProvider: SelectableUnitsProvider) {
		super(unitSearchEntityProvider, [
			'callSign',
			'callSignAbbreviation',
			'name',
		]);
	}
}

/*
	This service handles the selection of units in a context where a unit can only be selected once.
 */
@Injectable()
export class PossibleUnitSelectionsService extends EntitySelectionSearchService<
	Unit,
	{ units: Query['units'] }
> {
	protected query: TypedDocumentNode<{ units: Query['units'] }> = gql`
		query {
			units {
				id
				callSign
				callSignAbbreviation
				name
				status {
					status
					receivedAt
					source
				}
				assignment {
					__typename
					id
					name
				}
			}
		}
	`;
	protected queryName = 'units' as const;
	protected searchService: EntitySearchService<Unit> = inject(
		SelectableUnitSearchService,
	);
}
