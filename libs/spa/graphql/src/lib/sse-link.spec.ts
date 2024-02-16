import { Operation } from '@apollo/client/core';
import { createMock } from '@golevelup/ts-jest';

import { gql } from './gql-tag';
import { SSELink } from './sse-link';

describe('SSELink', () => {
	it('should subscribe to SSE client and return an Observable', async () => {
		const operation = createMock<Operation>({
			operationName: 'test',
			query: gql('query { test { id } }'),
		});

		const sseLink = new SSELink({
			url: 'http://somesseendpoint:1234',
			fetchFn: () => Promise.resolve(),
		});

		const mockSubscribe = jest.spyOn(sseLink['client'], 'subscribe');

		sseLink.request(operation).subscribe(() => {});

		expect(mockSubscribe).toHaveBeenCalledWith(
			expect.objectContaining({
				operationName: 'test',
				query: `{
  test {
    id
  }
}`,
			}),
			expect.objectContaining({
				next: expect.any(Function),
				complete: expect.any(Function),
				error: expect.any(Function),
			}),
		);
	});
});
