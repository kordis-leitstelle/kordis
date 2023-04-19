import { createMock } from '@golevelup/ts-jest';
import { ServiceUnavailableException } from '@nestjs/common';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { KordisRequest } from '@kordis/api/shared';

import { GraphqlSubscriptionsController } from './graphql-subscriptions.controller';

describe('GraphqlSubscriptionsController', () => {
	let controller: GraphqlSubscriptionsController;
	let module: TestingModule;

	beforeEach(async () => {
		module = await Test.createTestingModule({
			providers: [
				{
					provide: GraphQLSchemaHost,
					useValue: createMock<GraphQLSchemaHost>(),
				},
			],
			controllers: [GraphqlSubscriptionsController],
		}).compile();

		controller = module.get<GraphqlSubscriptionsController>(
			GraphqlSubscriptionsController,
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should throw ServiceUnavailableException if handler not ready', () => {
		const requestEmuFn = () => controller.subscriptionHandler(null, null);
		expect(requestEmuFn).toThrow(ServiceUnavailableException);
		expect(requestEmuFn).toThrow(
			'GraphQL Subscription handler not ready yet. Try again.',
		);
	});

	it('should allow subscriptions if handler ready', async () => {
		controller.onModuleInit();

		const fn = jest.fn();
		fn.mockReturnValue(Promise.resolve(true));

		(controller as any).handler = fn;

		await expect(
			controller.subscriptionHandler(
				createMock<KordisRequest>(),
				createMock<Response>(),
			),
		).resolves.toBeTruthy();
		expect(fn).toHaveBeenCalled();
	});
});
