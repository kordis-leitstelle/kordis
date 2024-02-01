import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
	UnauthorizedException,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';
import { KordisGqlContext, KordisRequest } from '@kordis/api/shared';

import { VerifyAuthUserStrategy } from '../auth-strategies/verify-auth-user.strategy';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	private readonly logger: KordisLogger = new Logger(AuthInterceptor.name);

	constructor(private readonly authUserExtractor: VerifyAuthUserStrategy) {}

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

			if (req.path === '/health-check') {
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

			return throwError(() => new UnauthorizedException());
		}

		req.user = possibleAuthUser;

		return next.handle();
	}
}
