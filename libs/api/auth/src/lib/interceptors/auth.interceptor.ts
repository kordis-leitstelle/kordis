import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';
import { KordisGqlContext, KordisRequest } from '@kordis/api/shared';
import { Role } from '@kordis/shared/auth';

import { AuthUserExtractorStrategy } from '../auth-user-extractor-strategies/auth-user-extractor.strategy';
import { METADATA_ROLE_KEY } from '../decorators/minimum-role.decorator';
import { PresentableUnauthorizedException } from '../errors/presentable-unauthorized.exception';
import { isRoleAllowed } from '../roles';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	private readonly logger: KordisLogger = new Logger(AuthInterceptor.name);

	constructor(
		private readonly authUserExtractor: AuthUserExtractorStrategy,
		private readonly reflector: Reflector,
	) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		let req: KordisRequest;
		if (context.getType<GqlContextType>() === 'graphql') {
			const ctx = GqlExecutionContext.create(context);
			req = ctx.getContext<KordisGqlContext>().req;
		} else {
			req = context.switchToHttp().getRequest<KordisRequest>();
		}

		const possibleAuthUser = this.authUserExtractor.getUserFromRequest(req);

		if (!possibleAuthUser) {
			this.logger.warn('Request without any extractable auth user', {
				headers: req.headers,
				body: req.body,
				params: req.params,
			});
			// This is just intended to be a fallback, as we currently only aim to support running the API behind an OAuth Proxy
			// You could write a custom auth user strategy which handles your auth process and return null if unauthorized
			return throwError(() => new PresentableUnauthorizedException());
		}

		const minimumRole = this.reflector.get<Role | undefined>(
			METADATA_ROLE_KEY,
			context.getHandler(),
		);
		if (minimumRole && !isRoleAllowed(possibleAuthUser.role, minimumRole)) {
			return throwError(() => new PresentableUnauthorizedException());
		}

		req.user = possibleAuthUser;

		return next.handle();
	}
}
