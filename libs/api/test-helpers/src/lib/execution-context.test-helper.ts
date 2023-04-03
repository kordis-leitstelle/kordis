import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

import { KordisRequest } from '@kordis/api/shared';

export function createContextForRequest(req: KordisRequest) {
	return createMock<ExecutionContext>({
		getArgs(): any[] {
			return [null, null, { req }, null];
		},
		getType(): string {
			return 'graphql';
		},
	});
}
