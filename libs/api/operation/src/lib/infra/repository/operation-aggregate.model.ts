import { OperationDocument } from '../schema/operation.schema';

export interface OperationUnitInvolvement {
	unitId: string;
	isPending: boolean;
	involvementTimes: {
		start: Date;
		end: Date | null;
	}[];
}

export interface OperationAlertGroupInvolvement {
	alertGroupId: string;
	unitInvolvements: OperationUnitInvolvement[];
}

export class OperationAggregateModel extends OperationDocument {
	unitInvolvements: OperationUnitInvolvement[];
	alertGroupInvolvements: OperationAlertGroupInvolvement[];
}
