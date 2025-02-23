import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { gql } from './gql-tag';
import { GraphqlService } from './graphql.service';
import { MultiSubscriptionService } from './multi-subscription.service';

describe('MultiSubscriptionService', () => {
	let service: MultiSubscriptionService;
	let graphqlService: GraphqlService;

	beforeEach(() => {
		const graphqlServiceMock = {
			subscribe$: jest.fn().mockReturnValue(of()),
		};

		TestBed.configureTestingModule({
			providers: [
				MultiSubscriptionService,
				{ provide: GraphqlService, useValue: graphqlServiceMock },
			],
		});

		service = TestBed.inject(MultiSubscriptionService);
		graphqlService = TestBed.inject(GraphqlService);
	});

	it('should call subscribe$ with the correct constructed DocumentNode', () => {
		const fields = ['field1', 'field2'];
		service.subscribeToMultiple$(fields as any).subscribe();

		fields.forEach((field) => {
			const expectedQuery = gql`subscription {
				${field} {
					id
				}
			}`;
			expect(graphqlService.subscribe$).toHaveBeenCalledWith(expectedQuery);
		});
	});
});
