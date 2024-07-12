export interface CommandRescueStationData {
	rescueStationId: string;
	assignedAlertGroups: {
		alertGroupId: string;
		unitIds: string[];
	}[];
	assignedUnitIds: string[];
	note: string;
	strength: {
		leaders: number;
		subLeaders: number;
		helpers: number;
	};
}
