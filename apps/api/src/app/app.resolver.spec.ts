import { Test } from '@nestjs/testing';

import { AppResolver } from './app.resolver';
import { AppService } from './app.service';

describe('AppController', () => {
	let resolver: AppResolver;

	beforeEach(async () => {
		const app = await Test.createTestingModule({
			controllers: [AppResolver],
			providers: [AppService],
		}).compile();

		resolver = app.get<AppResolver>(AppResolver);
	});

	describe('getData', () => {
		it('should return "Welcome to api!"', () => {
			expect(resolver.data()).toEqual({ message: 'Welcome to api!' });
		});
	});
});
