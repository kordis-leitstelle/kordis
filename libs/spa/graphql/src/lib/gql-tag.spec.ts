import { FieldNode, OperationDefinitionNode } from 'graphql/language';

import { gql } from './gql-tag';

describe('gql-tag', () => {
	it('should return a TypedDocumentNode', () => {
		const gqlStr = 'query { hello }';
		const result = gql(gqlStr);

		expect(result).toBeDefined();
		expect(result.kind).toBe('Document');
		expect(result.definitions).toHaveLength(1);
		expect(result.definitions[0].kind).toBe('OperationDefinition');
		const operationNode = result.definitions[0] as OperationDefinitionNode;
		expect(operationNode.operation).toBe('query');
		expect(operationNode.selectionSet.selections[0].kind).toBe('Field');
		expect(
			(operationNode.selectionSet.selections[0] as FieldNode).name.value,
		).toBe('hello');
	});
});
