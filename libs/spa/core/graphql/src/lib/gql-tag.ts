import { TypedDocumentNode, gql as gqlTag } from '@apollo/client/core';

function typedGQLTag<Result, Variables>(
	literals: ReadonlyArray<string> | Readonly<string>,
	...placeholders: unknown[]
): TypedDocumentNode<Result, Variables> {
	return gqlTag(literals, ...placeholders);
}

export const gql = typedGQLTag;
