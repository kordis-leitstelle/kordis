import { Injectable } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';

import { AlertGroup, Query } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { ASSIGNMENTS_FIELDS } from './assignments.fragment';
import { EntitySelectionService } from './entity-selection.service';

/*
	This service handles the selection of alert groups in a context where a unit can only be selected once.
 */
@Injectable()
export class PossibleAlertGroupSelectionsService extends EntitySelectionService<
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
						${ASSIGNMENTS_FIELDS}
					}
				}
				assignment {
					${ASSIGNMENTS_FIELDS}
				}
			}
		}
	`;
	protected queryName = 'alertGroups' as const;
}
