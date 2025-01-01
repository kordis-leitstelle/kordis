import { Injectable } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';

import { AlertGroup, Query } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { EntitySearchEngine } from './entity-search.service';
import { EntitySelectionSearchService } from './entity-selection-search.service';
import { alertGroupMatchesByName } from './match-strategies';

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
	protected searchService = new EntitySearchEngine(alertGroupMatchesByName);
}
