export interface Unit {
	ric: string;
	acronym: string;
	issi?: string;
	name: string;
	status: number;
	strength: Strength;
	position: {
		lat: number;
		lon: number;
		lastSetAt: Date;
		lastSetBy: string;
	};
	defaultDeployment?: Deployment;
	currentDeployment?: Deployment;
}

/*
	Deployments are logical components of a location and units. A deployment can be static or dynamic.
	A static deployment is usually a station, that persists and is always present, a dynamic deployment is an operation that is short-living.
 */
export interface Deployment {
	strength: Strength;
	location: Location;
	name: string;
	units: Unit[];
	isStatic: boolean;
}

export interface Strength {
	leader: number;
	subLeader: number;
	helper: number;
	total: number;
}
