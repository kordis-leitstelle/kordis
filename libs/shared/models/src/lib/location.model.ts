export interface Address {
	name: string;
	street: string;
	houseNumber: string;
	postCode: string;
	city: string;
}

export interface Location {
	displayValue: string;
	displayValueShort: string;
	address: Address;
	geometries: (Geometry & GeometryProperties)[];
	centroid: {
		lat: number;
		lon: number;
	};
}

export interface GeometryProperties {
	name: string;
}

export interface Point {
	type: 'Point';
	coordinates: [number, number];
}

export interface MultiPoint {
	type: 'MultiPoint';
	coordinates: [number, number][];
}

export interface LineString {
	type: 'LineString';
	coordinates: [number, number][];
}

export interface MultiLineString {
	type: 'MultiLineString';
	coordinates: [number, number][][];
}

export interface Polygon {
	type: 'Polygon';
	coordinates: [number, number][][];
}

export interface MultiPolygon {
	type: 'MultiPolygon';
	coordinates: [number, number][][][];
}

export type Geometry =
	| Point
	| MultiPoint
	| LineString
	| MultiLineString
	| Polygon
	| MultiPolygon;

export interface GeometryCollection {
	type: 'GeometryCollection';
	geometries: Geometry[];
}
