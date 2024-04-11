import {
	ApolloQueryResult,
	DocumentNode,
	FetchResult,
} from '@apollo/client/core';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Apollo, MutationResult, QueryRef } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';

import { GraphqlService } from './graphql.service';

describe('GraphqlService', () => {
	let graphqlService: GraphqlService;
	let apolloMock: DeepMocked<Apollo>;

	beforeEach(() => {
		apolloMock = createMock<Apollo>();
		graphqlService = new GraphqlService(apolloMock);
	});

	it('should call apollo.query and return the response', async () => {
		const query = {} as DocumentNode;
		const variables = {};
		const response = {
			data: { foo: 'bar' },
			errors: undefined,
		} as ApolloQueryResult<unknown>;

		apolloMock.query.mockReturnValue(of(response));

		const result = await firstValueFrom(
			graphqlService.queryOnce$(query, variables),
		);
		expect(apolloMock.query).toHaveBeenCalledWith({
			query,
			variables,
		});
		expect(result).toEqual({
			data: { foo: 'bar' },
		});
	});

	it('should call apollo.watchQuery and return query ref', async () => {
		const query = {} as DocumentNode;
		const variables = {};

		const queryRefMock = createMock<QueryRef<unknown>>({
			// eslint-disable-next-line rxjs/finnish
			valueChanges: of({ data: { foo: 'bar' }, errors: null }),
			refetch: jest
				.fn()
				.mockResolvedValue({ data: { foo: 'refreshed' }, errors: null }),
		});

		apolloMock.watchQuery.mockReturnValue(queryRefMock);

		const { $, refresh } = graphqlService.query(query, variables);

		expect(apolloMock.watchQuery).toHaveBeenCalledWith({
			query,
			variables,
		});

		await expect(firstValueFrom($)).resolves.toEqual({
			data: { foo: 'bar' },
			errors: null,
		});

		await expect(refresh(variables)).resolves.toEqual({
			data: { foo: 'refreshed' },
			errors: null,
		});
	});

	it('should call apollo.mutate and return the response', async () => {
		const mutation = {} as DocumentNode;
		const variables = {};
		const optimisticResponse = { foo: 'bar' };
		const response: MutationResult = {
			loading: false,
			data: { foo: 'bar' },
		};

		apolloMock.mutate.mockReturnValue(of(response));

		const result = await firstValueFrom(
			graphqlService.mutate$(mutation, variables, optimisticResponse),
		);

		expect(apolloMock.mutate).toHaveBeenCalledWith({
			mutation,
			variables,
			optimisticResponse: {
				__typename: 'Mutation',
				...optimisticResponse,
			},
		});
		expect(result).toEqual({
			data: {
				foo: 'bar',
			},
		});
	});

	it('should call apollo.subscribe and return the response', async () => {
		const query = {} as DocumentNode;
		const variables = {};
		const response: FetchResult = {
			data: { foo: 'bar' },
		};

		apolloMock.subscribe.mockReturnValue(of(response));

		const result = await firstValueFrom(
			graphqlService.subscribe$(query, variables),
		);
		expect(apolloMock.subscribe).toHaveBeenCalledWith(
			{
				query,
				variables,
			},
			{
				useZone: false,
			},
		);
		expect(result).toEqual({
			data: { foo: 'bar' },
		});
	});
});
