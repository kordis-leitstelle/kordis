export interface GeoAddress {
	name?: string;
	street: string;
	city: string;
	postalCode: string;
}

export interface GeoSearchResult {
	displayValue: string;
	address: GeoAddress;
	coordinate: {
		lat: number;
		lon: number;
	};
}
