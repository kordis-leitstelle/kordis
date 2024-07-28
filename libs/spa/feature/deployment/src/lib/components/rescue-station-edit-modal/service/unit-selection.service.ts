import { Injectable, inject } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';

import { Query, Unit } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { EntitySearchService } from '../../../services/entity-search.service';
import { UnitSearchService } from '../../../services/unit-search.service';
import { PossibleEntitySelectionsService } from './possible-entity-selection.service';

/*
	This service handles the selection of units in a context where a unit can only be selected once.
 */
@Injectable()
export class PossibleUnitSelectionsService extends PossibleEntitySelectionsService<
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
	protected searchService: EntitySearchService<Unit> =
		inject(UnitSearchService);
}
