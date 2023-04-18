import { Test, TestingModule } from '@nestjs/testing';

import { GraphqlSubscriptionsController } from './graphql-subscriptions.controller';

describe('GraphqlSubscriptionsController', () => {
	let controller: GraphqlSubscriptionsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GraphqlSubscriptionsController],
		}).compile();

		controller = module.get<GraphqlSubscriptionsController>(
			GraphqlSubscriptionsController,
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
