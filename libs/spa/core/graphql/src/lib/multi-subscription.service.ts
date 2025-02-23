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
	subscribeToMultiple$(fields: (keyof Subscription)[]): Observable<void> {
		return merge(
			fields.map((field) => {
				const query = `subscription {
					${field} {
						id
					}
				}`;
				this.gqlService.subscribe$(gql`
					${query}
				`);
			}),
		).pipe(map(() => undefined));
	}
}
