import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
	HttpClientTestingModule,
	HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AUTH_SERVICE } from '../services/auth-service';
import { DevAuthService } from '../services/dev-auth.service';
import { DevAuthInterceptor } from './dev-auth.interceptor';

describe('DevAuthInterceptor', () => {
	let authService: DevAuthService;
	let httpClient: HttpClient;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				{ provide: AUTH_SERVICE, useClass: DevAuthService },
				{
					provide: HTTP_INTERCEPTORS,
					useClass: DevAuthInterceptor,
					multi: true,
				},
			],
		});

		authService = TestBed.inject<DevAuthService>(AUTH_SERVICE);
		httpClient = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
		localStorage.clear();
	});

	it('should add an Authorization header with Bearer token when token is present', () => {
		const token =
			'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJvaWQiOiIxYTJiM2M0ZCIsImVtYWlscyI6WyJqb2huLmRvZUBleGFtcGxlLmNvbSJdLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiRG9lIn0.';
		authService.setSession({
			id: '1a2b3c4d',
			firstName: 'John',
			lastName: 'Doe',
			email: 'john.doe@example.com',
		});

		httpClient.get('/test').subscribe();

		const httpRequest = httpTestingController.expectOne('/test');

		expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
		expect(httpRequest.request.headers.get('Authorization')).toBe(
			`Bearer ${token}`,
		);
	});

	it('should not add an Authorization header when token is not present', () => {
		httpClient.get('/test').subscribe();

		const httpRequest = httpTestingController.expectOne('/test');

		expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();
	});
});
