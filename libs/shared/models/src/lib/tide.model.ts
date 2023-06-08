// https://www.pegelonline.wsv.de/webservice/dokuRestapi
export interface Tide {
	futureSeries: { date: Date; type: 'high' | 'low' }[];
	currentMeasurement: number;
	currentTrend: 'up' | 'down';
	station: {
		id: string;
		agency: string;
		name: string;
		km: number;
		water: string;
	};
}
