import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { KordisRequest } from '@kordis/api/shared';

export const User = createParamDecorator((ctx: ExecutionContext) => {
	const { user }: KordisRequest = ctx.switchToHttp().getRequest();
	return user;
});
