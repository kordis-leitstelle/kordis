import { createMock } from '@golevelup/ts-jest';

import { KordisRequest } from '@kordis/api/shared';
import {
	createGqlContextForRequest,
	createParamDecoratorFactory,
} from '@kordis/api/test-helpers';
import { AuthUser } from '@kordis/shared/model';

import { User } from './user.decorator';

describe('User Decorator', () => {
	it('should return user from request', () => {
		const user: AuthUser = {
			id: 'id123',
			email: 'someemail@gmail.com',
			firstName: 'somefirstname',
			lastName: 'somelastname',
			organization: 'someorganization',
		};
		const req = createMock<KordisRequest>({
			user,
		});
		const context = createGqlContextForRequest(req);
		const factory = createParamDecoratorFactory(User);
		const result = factory(null, context);
		expect(result).toEqual(user);
	});
});
