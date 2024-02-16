import { createMock } from '@golevelup/ts-jest';

import { KordisRequest } from '@kordis/api/shared';
import {
	createGqlContextForRequest,
	createParamDecoratorFactory,
} from '@kordis/api/test-helpers';
import { AuthUser, Role } from '@kordis/shared/model';

import { RequestUser } from './req-user.decorator';

describe('req-user.decorator', () => {
	it('should return user from request', () => {
		const user: AuthUser = {
			id: 'id123',
			email: 'someemail@gmail.com',
			firstName: 'somefirstname',
			lastName: 'somelastname',
			role: Role.USER,
			organizationId: 'org123',
		};
		const req = createMock<KordisRequest>({
			user,
		});
		const context = createGqlContextForRequest(req);
		const factory = createParamDecoratorFactory(RequestUser);
		const result = factory(null, context);
		expect(result).toEqual(user);
	});
});
