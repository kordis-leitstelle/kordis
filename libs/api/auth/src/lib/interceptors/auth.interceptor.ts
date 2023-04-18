import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
	UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';

import { KordisGqlContext } from '@kordis/api/shared';

import { AuthUserExtractorStrategy } from '../auth-user-extractor-strategies/auth-user-extractor.strategy';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	constructor(private readonly authUserExtractor: AuthUserExtractorStrategy) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle();
		const ctx = GqlExecutionContext.create(context);
		const req = ctx.getContext<KordisGqlContext>().req;

		const possibleAuthUser = this.authUserExtractor.getUserFromRequest(req);

		if (!possibleAuthUser) {
			// This is just intended to be a fallback, as we currently only aim to support running the API behind an OAuth Proxy
			// You could write a custom auth user strategy which handles your auth process and return null if unauthorized
			return throwError(() => new UnauthorizedException());
		}

		req.user = possibleAuthUser;

		return next.handle();
	}
}
