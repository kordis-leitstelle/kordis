import type { GraphQLFormattedError } from 'graphql/error';

export default interface GraphqlErrorConvertable {
	asGraphQLError(): GraphQLFormattedError;
}
