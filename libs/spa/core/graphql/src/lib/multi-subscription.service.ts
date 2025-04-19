import { Injectable, inject } from '@angular/core';
import { Observable, map, merge } from 'rxjs';

import { Subscription } from '@kordis/shared/model';

import { gql } from './gql-tag';
import { GraphqlService } from './graphql.service';

@Injectable({
	providedIn: 'root',
})
export class MultiSubscriptionService {
	private readonly gqlService = inject(GraphqlService);

	/*
		A helper function to subscribe to multiple subscriptions at once where no return is required.
		It subscribes to the fields and only queries the id field of the returned object type.
	 */
	subscribeToMultiple$(
		fields: (
			| keyof Subscription
			| { field: keyof Subscription; queryFields: string | null }
		)[],
	): Observable<void> {
		return merge(
			fields.map((field) => {
				let query: string;
				if (typeof field === 'string') {
					query = `subscription {
						${field} {
							id
						}
					}`;
				} else if (field.queryFields) {
					query = `subscription {
						${field.field} {
							${field.queryFields}
						}
					}`;
				} else {
					query = `subscription {
						${field.field}
					}`;
				}
				return this.gqlService.subscribe$(gql`
					${query}
				`);
			}),
		).pipe(map(() => undefined));
	}
}
