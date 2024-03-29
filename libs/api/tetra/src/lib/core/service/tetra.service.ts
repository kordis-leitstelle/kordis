export const TETRA_SERVICE = Symbol('TETRA_SERVICE');

export interface TetraService {
	sendSDS(
		orgId: string,
		issi: string,
		message: string,
		isFlash?: boolean,
	): Promise<void>;

	sendCallOut(
		orgId: string,
		issi: string,
		message: string,
		noReply: boolean,
		prio?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
	): Promise<void>;

	sendStatus(
		orgId: string,
		issi: string,
		status: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
	): Promise<void>;
}
