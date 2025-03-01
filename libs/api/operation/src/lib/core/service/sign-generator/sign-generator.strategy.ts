import { DbSessionProvider } from '@kordis/api/shared';

export const SIGN_GENERATOR = Symbol('SIGN_GENERATOR');

export interface SignGenerator {
	generateNextOperationSign(
		orgId: string,
		uow?: DbSessionProvider,
	): Promise<string>;
}
