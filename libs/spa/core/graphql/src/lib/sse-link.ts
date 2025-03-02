import {
	ApolloLink,
	FetchResult,
	Observable,
	Operation,
} from '@apollo/client/core';
import { print } from 'graphql';
import { Client, ClientOptions, createClient } from 'graphql-sse';

export class SSELink extends ApolloLink {
	private client: Client<true>;

	constructor(options: ClientOptions<true>) {
		super();
		this.client = createClient(options);
	}

	// eslint-disable-next-line rxjs/finnish
	public override request(operation: Operation): Observable<FetchResult> {
		return new Observable((sink) => {
			return this.client.subscribe(
				{ ...operation, query: print(operation.query) },
				{
					next: sink.next.bind(sink),
					complete: sink.complete.bind(sink),
					error: sink.error.bind(sink),
				},
			);
		});
	}
}
