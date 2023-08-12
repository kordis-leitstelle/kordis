import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';

import { AuthUserExtractorStrategy } from '../auth-user-extractor-strategies/auth-user-extractor.strategy';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	private readonly logger: KordisLogger = new Logger(AuthInterceptor.name);

	constructor(private readonly authUserExtractor: AuthUserExtractorStrategy) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle();

		/*	let req: KordisRequest;
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
        return throwError(() => new UnauthorizedException());
      }

      req.user = possibleAuthUser;

      return next.handle(); */
	}
}
