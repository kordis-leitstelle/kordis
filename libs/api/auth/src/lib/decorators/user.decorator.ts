import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import type { KordisGqlContext } from '@kordis/api/shared';

export const User = createParamDecorator((_: never, ctx: ExecutionContext) => {
	const req =
		GqlExecutionContext.create(ctx).getContext<KordisGqlContext>().req;
	return req.user;
});
