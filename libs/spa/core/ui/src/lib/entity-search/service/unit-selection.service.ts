import { Injectable } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';

import { Query, Unit } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { ASSIGNMENTS_FIELDS } from './assignments.fragment';
import { EntitySearchEngine } from './entity-search.service';
import { EntitySelectionSearchService } from './entity-selection-search.service';
import { unitMatchesByNameOrCallSign } from './match-strategies';

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
					${ASSIGNMENTS_FIELDS}
				}
			}
		}
	`;
	protected queryName = 'units' as const;
	protected searchService = new EntitySearchEngine(unitMatchesByNameOrCallSign);
}
