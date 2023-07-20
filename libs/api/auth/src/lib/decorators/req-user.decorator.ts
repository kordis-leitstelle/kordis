import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { KordisGqlContext } from '@kordis/api/shared';

export const RequestUser = createParamDecorator(
	(_: never, ctx: ExecutionContext) => {
		const req =
			GqlExecutionContext.create(ctx).getContext<KordisGqlContext>().req;
		return req.user;
	},
);
