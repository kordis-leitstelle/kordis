import { Injectable } from '@angular/core';

import { AlertGroup, Query } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { AbstractEntitySearchService } from './entity-search.service';

@Injectable({
	providedIn: 'root',
})
export class AlertGroupSearchService extends AbstractEntitySearchService<
	AlertGroup,
	{ alertGroups: Query['alertGroups'] },
	{ alertGroup: Query['alertGroup'] }
> {
	protected constructor() {
		super(
			gql`
				query GetAlertGroups {
					alertGroups {
						id
						name
					}
				}
			`,
			gql`
				query GetAlertGroup($id: String!) {
					alertGroup(id: $id) {
						id
						name
						units {
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
			'alertGroups',
			'alertGroup',
			['name'],
		);
	}
}
