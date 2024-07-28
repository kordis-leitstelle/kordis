import { Injectable, inject } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';

import { AlertGroup, Query } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { AlertGroupSearchService } from '../../../services/alert-group-search.service';
import { EntitySearchService } from '../../../services/entity-search.service';
import { PossibleEntitySelectionsService } from './possible-entity-selection.service';

@Injectable()
export class PossibleAlertGroupSelectionsService extends PossibleEntitySelectionsService<
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
				units {
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
		AlertGroupSearchService,
	);
}
