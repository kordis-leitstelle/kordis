import { AlertGroup, Unit } from '@kordis/shared/model';

export interface AlertGroupAssignment {
	alertGroup: AlertGroup;
	assignedUnits: Unit[];
}
