import {
	EnvironmentProviders,
	InjectionToken,
	inject,
	makeEnvironmentProviders,
} from '@angular/core';
import { from, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { AUTH_SERVICE } from '@kordis/spa/core/auth';

import { cache } from './cache';
import { SSELink } from './sse-link';

const GRAPHQL_ENDPOINT = new InjectionToken<string>('GRAPHQL_ENDPOINT');
const GRAPHQL_SSE_ENDPOINT = new InjectionToken<string>('GRAPHQL_SSE_ENDPOINT');

export function provideGraphQL(
	endpoint: string,
	sseEndpoint: string,
): EnvironmentProviders {
	return makeEnvironmentProviders([
		{ provide: GRAPHQL_ENDPOINT, useValue: endpoint },
		{ provide: GRAPHQL_SSE_ENDPOINT, useValue: sseEndpoint },
		provideApollo(() => {
			const httpLink = inject(HttpLink);
			const authService = inject(AUTH_SERVICE);
			const endpoint = inject(GRAPHQL_ENDPOINT);
			const sseEndpoint = inject(GRAPHQL_SSE_ENDPOINT);

			const authHeaderFactory = (): { authorization: string } => ({
				authorization: `Bearer ${authService.getAccessToken()}`,
			});

			const requestLink = split(
				({ query }) => {
					const definition = getMainDefinition(query);
					return (
						definition.kind === 'OperationDefinition' &&
						definition.operation === 'subscription'
					);
				},
				new SSELink({
					url: sseEndpoint,
					singleConnection: true,
					headers: () => ({
						...authHeaderFactory(),
					}),
				}),
				httpLink.create({ uri: endpoint }),
			);

			const error = onError(({ networkError }) => {
				if (
					networkError &&
					'status' in networkError &&
					networkError.status === 401
				) {
					authService.logout();
				}
			});

			const setAuthorization = setContext((_, { headers }) => ({
				headers: {
					...headers,
					...authHeaderFactory(),
				},
			}));

			return {
				cache: cache,
				link: from([setAuthorization, error, requestLink]),
			};
		}),
	]);
}
