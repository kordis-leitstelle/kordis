import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { KordisRequest } from '@kordis/api/shared';

export function createGqlContextForRequest(req: KordisRequest) {
	return createMock<ExecutionContext>({
		getArgs(): any[] {
			return [null, null, { req }, null];
		},
		getType(): string {
			return 'graphql';
		},
	});
}

export function createHttpContextForRequest(req: KordisRequest) {
	return createMock<ExecutionContext>({
		getType(): string {
			return 'http';
		},
		switchToHttp(): HttpArgumentsHost {
			return createMock<HttpArgumentsHost>({
				getRequest(): KordisRequest {
					return req;
				},
			});
		},
	});
}
