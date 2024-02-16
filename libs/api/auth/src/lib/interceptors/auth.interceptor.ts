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
import { Role } from '@kordis/shared/model';

import { VerifyAuthUserStrategy } from '../auth-strategies/verify-auth-user.strategy';
import { METADATA_ROLE_KEY } from '../decorators/minimum-role.decorator';
import { PresentableUnauthorizedException } from '../errors/presentable-unauthorized.exception';
import { isRoleAllowed } from '../roles';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	private readonly logger: KordisLogger = new Logger(AuthInterceptor.name);

	constructor(
		private readonly authUserExtractor: VerifyAuthUserStrategy,
		private readonly reflector: Reflector,
	) {}

	async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<unknown>> {
		let req: KordisRequest;
		if (context.getType<GqlContextType>() === 'graphql') {
			const ctx = GqlExecutionContext.create(context);
			req = ctx.getContext<KordisGqlContext>().req;
		} else {
			req = context.switchToHttp().getRequest<KordisRequest>();

			if (req.path === '/health-check' || req.path.startsWith('/webhooks')) {
				return next.handle();
			}
		}

		const possibleAuthUser =
			await this.authUserExtractor.verifyUserFromRequest(req);

		if (!possibleAuthUser) {
			this.logger.warn('Request with invalid JWT', {
				headers: req.headers,
				body: req.body,
				params: req.params,
			});

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
