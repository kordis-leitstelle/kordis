export interface SetUnitInvolvementDto {
	unitId: string;
	involvementTimes: {
		start: Date;
		end: Date | null;
	}[];
	isPending: boolean;
}

export interface SetAlertGroupInvolvementDto {
	alertGroupId: string;
	unitInvolvements: SetUnitInvolvementDto[];
}
