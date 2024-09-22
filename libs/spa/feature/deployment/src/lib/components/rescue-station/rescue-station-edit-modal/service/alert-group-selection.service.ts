import { Injectable, inject } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';
import { firstValueFrom, map } from 'rxjs';

import { AlertGroup, Query } from '@kordis/shared/model';
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
class SelectableAlertGroupsProvider
	implements SearchEntityProvider<AlertGroup>
{
	private readonly gqlService = inject(GraphqlService);

	provideByIds(ids: string[]): Promise<AlertGroup[]> {
		return firstValueFrom(
			this.gqlService
				.queryOnce$<{ alertGroups: Query['alertGroups'] }>(
					gql`
						query GetAlertGroupsByIds($ids: [String!]!) {
							alertGroups(filter: { ids: $ids }) {
								id
								name
								currentUnits {
									id
									name
									callSign
									note
									status {
										status
									}
									assignment {
										__typename
										id
										name
									}
								}
								assignment {
									__typename
									id
									name
								}
							}
						}
					`,
					{
						ids,
					},
				)
				.pipe(map(({ alertGroups }) => alertGroups)),
		);
	}

	provideInitial(): Promise<AlertGroup[]> {
		return firstValueFrom(
			this.gqlService
				.queryOnce$<{ alertGroups: Query['alertGroups'] }>(gql`
					query GetAlertGroups {
						alertGroups {
							id
							name
						}
					}
				`)
				.pipe(map(({ alertGroups }) => alertGroups)),
		);
	}
}

@Injectable({
	providedIn: 'root',
})
class SelectableAlertGroupSearchService extends AbstractEntitySearchService<AlertGroup> {
	protected constructor(alertGroupsProvider: SelectableAlertGroupsProvider) {
		super(alertGroupsProvider, ['name']);
	}
}

/*
	This service handles the selection of alert groups in a context where a unit can only be selected once.
 */
@Injectable()
export class PossibleAlertGroupSelectionsService extends EntitySelectionSearchService<
	AlertGroup,
	{ alertGroups: Query['alertGroups'] }
> {
	protected override query: TypedDocumentNode<{
		alertGroups: Query['alertGroups'];
	}> = gql`
		query {
			alertGroups {
				id
				name
				currentUnits {
					id
					name
					callSign
					status {
						status
					}
					assignment {
						__typename
						id
						name
					}
				}
				assignment {
					__typename
					id
					name
				}
			}
		}
	`;
	protected queryName = 'alertGroups' as const;
	protected searchService: EntitySearchService<AlertGroup> = inject(
		SelectableAlertGroupSearchService,
	);
}
