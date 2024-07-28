import { Injectable } from '@angular/core';

import { Query, Unit } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { AbstractEntitySearchService } from './entity-search.service';

@Injectable({
	providedIn: 'root',
})
export class UnitSearchService extends AbstractEntitySearchService<
	Unit,
	{ units: Query['units'] },
	{ unit: Query['unit'] }
> {
	constructor() {
		super(
			gql`
				query GetUnits {
					units {
						id
						callSign
						callSignAbbreviation
						name
						assignment {
							__typename
						}
					}
				}
			`,
			gql`
				query GetUnit($id: String!) {
					unit(id: $id) {
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
			`,
			'units',
			'unit',
			['callSign', 'callSignAbbreviation', 'name'],
		);
	}
}
