import { createMock } from '@golevelup/ts-jest';

import { KordisRequest } from '@kordis/api/shared';
import {
	createContextForRequest,
	createParamDecoratorFactory,
} from '@kordis/api/test-helpers';
import { AuthUser } from '@kordis/shared/auth';

import { User } from './user.decorator';

describe('User Decorator', () => {
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
		const context = createContextForRequest(req);
		const factory = createParamDecoratorFactory(User);
		const result = factory(null, context);
		expect(result).toEqual(user);
	});
});
