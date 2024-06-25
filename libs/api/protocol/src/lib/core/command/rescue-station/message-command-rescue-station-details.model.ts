export interface MessageCommandRescueStationDetails {
	id: string;
	name: string;
	callSign: string;
	strength: {
		leaders: number;
		subLeaders: number;
		helpers: number;
	};
	units: {
		id: string;
		name: string;
		callSign: string;
	}[];
	alertGroups: {
		id: string;
		name: string;
		units: {
			id: string;
			name: string;
			callSign: string;
		}[];
	}[];
}
