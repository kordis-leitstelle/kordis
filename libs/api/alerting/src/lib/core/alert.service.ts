import { OperationViewModel } from '@kordis/api/operation';

export const ALERT_SERVICE = Symbol('ALERT_SERVICE');
export interface AlertService {
	alertWithOperation(
		alertGroupIds: string[],
		operation: OperationViewModel,
		hasPriority: boolean,
		orgId: string,
	): Promise<void>;
}
