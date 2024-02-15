import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { trace } from '@opentelemetry/api';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';

import { KordisGqlContext, KordisRequest } from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

@Injectable()
export class SentryOTelUserContextInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		let user: AuthUser | undefined; // user can be undefined, since we have routes passed through the auth interceptor which don't require a user (/health-check)
		if (context.getType<GqlContextType>() === 'graphql') {
			const ctx = GqlExecutionContext.create(context);
			user = ctx.getContext<KordisGqlContext>().req.user;
		} else {
			user = context.switchToHttp().getRequest<KordisRequest>().user;
		}

		if (user) {
			trace.getActiveSpan()?.setAttributes({
				'user.id': user.id,
				'user.email': user.email,
				'user.name': `${user.firstName} ${user.lastName}`,
			});

			Sentry.setUser({
				id: user.id,
				email: user.email,
				username: `${user.firstName} ${user.lastName}`,
			});
		}

		return next.handle();
	}
}
