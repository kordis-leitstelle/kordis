import { GraphQLFormattedError } from 'graphql/error';

import GraphqlErrorConvertable from '../graphql-error-convertable';

/**
 * Errors are exclusive. Only Errors of type PresentableError will be delivered to external layers.
 */
export abstract class PresentableException
	extends Error
	implements GraphqlErrorConvertable
{
	abstract code: string;
	furtherExtensions?: Record<string, unknown>;

	protected constructor(message: string) {
		super(message);
	}

	asGraphQLError(): Mutable<GraphQLFormattedError> {
		return {
			message: this.message,
			extensions: {
				code: this.code,
				...this.furtherExtensions,
			},
		};
	}
}

export type Mutable<T> = { -readonly [k in keyof T]: T[k] };
