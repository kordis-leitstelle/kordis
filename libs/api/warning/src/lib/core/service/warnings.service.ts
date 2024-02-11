import { Feature, Geometry } from '@turf/turf';
import { Observable } from 'rxjs';

import { Warning } from '../model/warning.model';

export const WARNINGS_SERVICE = Symbol('WARNINGS_SERVICE');

export interface WarningsService {
	getWarningsForLocation(lat: number, lon: number): Promise<Warning[]>;

	/*
	 * Emits warnings if they are within or intersecting with the provided geometry (`geom`).
	 * @param geom - The geometry to filter warnings by.
	 */
	getWarningsInGeometryStream$(geom: Geometry | Feature): Observable<Warning>;
}
