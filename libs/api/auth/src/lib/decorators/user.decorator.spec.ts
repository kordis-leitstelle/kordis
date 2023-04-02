import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { KordisRequest } from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/auth';

import { User } from './user.decorator';

describe('User Decorator', () => {
	function getParamDecoratorFactory(decorator: () => ParameterDecorator) {
		class TestDecorator {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			public test(@decorator() value): void {}
		}

		const args = Reflect.getMetadata(
			ROUTE_ARGS_METADATA,
			TestDecorator,
			'test',
		);
		return args[Object.keys(args)[0]].factory;
	}

	it('should return user from request', () => {
		const user: AuthUser = {
			id: 'id123',
			email: 'someemail@gmail.com',
			firstName: 'somefirstname',
			lastName: 'somelastname',
		};
		const req = createMock<KordisRequest>({
			user,
		});
		const context = createMock<ExecutionContext>({
			switchToHttp: () => ({
				getRequest: () => req,
			}),
		});
		const factory = getParamDecoratorFactory(User);
		const result = factory(context);
		expect(result).toEqual(user);
	});
});
