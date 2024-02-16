import { Role } from '@kordis/shared/model';

import { METADATA_ROLE_KEY, MinimumRole } from './minimum-role.decorator';

describe('minimum-role.decorator', () => {
	it('should set minimum role as metadata', () => {
		class TestClass {
			@MinimumRole(Role.ADMIN)
			someRequestHandler() {}
		}

		const metadata = Reflect.getMetadata(
			METADATA_ROLE_KEY,
			TestClass.prototype.someRequestHandler,
		);

		expect(metadata).toBe(Role.ADMIN);
	});
});
