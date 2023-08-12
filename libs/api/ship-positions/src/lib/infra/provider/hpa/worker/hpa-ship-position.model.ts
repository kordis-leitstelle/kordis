export interface HPAShipPosition {
	meta: {
		timestamp: string;
	};
	aissupport: boolean;
	radarsupport: boolean;
	position: {
		ais?: { navigationalStatus?: string; sog?: number };
		cog?: number;
		heading?: number;
		lat: number;
		lon: number;
		sog?: number;
		turningRate?: number;
	};
	vessel: {
		ais: {
			callsign?: string;
			length?: number;
			width?: number;
			mmsi: string;
			name?: string;
			navigationalStatus?: string;
			vesselClass?: string;
			vesselSubClass?: string;
		};
	};
}
