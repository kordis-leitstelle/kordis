import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { InMemoryCache, from, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { AUTH_SERVICE, AuthService } from '@kordis/spa/core/auth';

import { SSELink } from './sse-link';


@NgModule({
	imports: [ApolloModule, CommonModule],
})
export class GraphqlModule {
	static forRoot(
		endpoint: string,
		sseEndpoint: string,
	): ModuleWithProviders<GraphqlModule> {
		return {
			ngModule: GraphqlModule,
			providers: [
				{
					provide: APOLLO_OPTIONS,
					useFactory: (httpLink: HttpLink, authService: AuthService) => {
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
							httpLink.create({
								uri: endpoint,
							}),
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
							cache: new InMemoryCache(),
							link: from([setAuthorization, error, requestLink]),
						};
					},
					deps: [HttpLink, AUTH_SERVICE],
				},
			],
		};
	}
}
