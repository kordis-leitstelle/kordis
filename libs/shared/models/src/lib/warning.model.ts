import { GeometryCollection } from './location.model';

export interface Warning {
	sourceId: string;
	sourceVersion: number;
	sentAt: Date;
	sender: string;
	severity: string;
	effective: Date | null;
	expires: Date | null;
	title: string;
	description: string;
	instruction: string | null;
	affectedLocations: GeometryCollection;
}
