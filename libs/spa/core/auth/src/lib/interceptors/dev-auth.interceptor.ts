import {
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, first } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AUTH_SERVICE } from '../services/auth-service';
import { DevAuthService } from '../services/dev-auth.service';

@Injectable()
export class DevAuthInterceptor implements HttpInterceptor {
	private readonly authService = inject<DevAuthService>(AUTH_SERVICE);

	intercept(
		req: HttpRequest<unknown>,
		next: HttpHandler,
	): Observable<HttpEvent<unknown>> {
		return this.authService.token$.pipe(
			first(),
			switchMap((token) => {
				if (token) {
					const authReq = req.clone({
						setHeaders: {
							Authorization: `Bearer ${token}`,
						},
					});
					return next.handle(authReq);
				}
				return next.handle(req);
			}),
		);
	}
}
