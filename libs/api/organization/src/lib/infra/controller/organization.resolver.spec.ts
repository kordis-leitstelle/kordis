import { Test, TestingModule } from '@nestjs/testing';

import { OrganizationResolver } from './organization.resolver';

describe('OrganizationResolver', () => {
	let resolver: OrganizationResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [OrganizationResolver],
		}).compile();

		resolver = module.get<OrganizationResolver>(OrganizationResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});

	it('should resolve organization', () => {
		expect(resolver).toBeDefined();
	});
});
