import { Warning } from '../model/warning.model';

export const WARNING_SERVICE = Symbol('WARNING_SERVICE');

export interface WarningsService {
	getWarningsForLocation(lat: number, lon: number): Promise<Warning[]>;

	/*
	 * This checks for new warnings and returns only warnings, that have never been returned before.
	 */
	getNewWarnings(): Promise<Warning[]>;
}
