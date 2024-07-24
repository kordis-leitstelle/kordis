import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, first } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AUTH_SERVICE } from '../services/auth-service';
import { DevAuthService } from '../services/dev-auth.service';

@Injectable()
export class DevAuthInterceptor implements HttpInterceptor {
	constructor(@Inject(AUTH_SERVICE) private authService: DevAuthService) {}

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
