export const SIGN_GENERATOR = Symbol('SIGN_GENERATOR');

export interface SignGenerator {
	generateNextOperationSign(orgId: string): Promise<string>;
}
