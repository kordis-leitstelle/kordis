import type { GraphQLFormattedError } from 'graphql/error';

import type GraphqlErrorConvertable from './graphql-error-convertable';
import { PresentableUnknownException } from './presentable/presentable-unknown.exception';
import { PresentableException } from './presentable/presentable.exception';

/**
 * This acts as a safeguard for unhandled errors, since they get populated over graphql.
 * Every unhandled error will result in an UnknownError.
 */
export const errorFormatterFactory = (sanitizeErrors?: boolean) => {
	return (
		formattedError: GraphQLFormattedError,
		error: unknown,
	): GraphQLFormattedError => {
		if (
			typeof error === 'object' &&
			error != null &&
			'originalError' in error &&
			error.originalError instanceof PresentableException
		) {
			const convertableError: GraphqlErrorConvertable = error.originalError;
			return {
				...formattedError,
				...convertableError.asGraphQLError(),
			};
		}

		if (sanitizeErrors) {
			// sanitize all unknown errors
			return new PresentableUnknownException().asGraphQLError();
		}

		return formattedError;
	};
};
