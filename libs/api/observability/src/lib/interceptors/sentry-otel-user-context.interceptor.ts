import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { trace } from '@opentelemetry/api';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';

import { KordisGqlContext } from '@kordis/api/shared';

@Injectable()
export class SentryOTelUserContextInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const ctx = GqlExecutionContext.create(context);
		const { user } = ctx.getContext<KordisGqlContext>().req;

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

		return next.handle();
	}
}
