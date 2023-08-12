import { Observable } from 'rxjs';

import { ShipPositionFeature } from '../entity/ship-position.entity';

export interface ShipPositionsService {
	/*
	 * Returns a stream of ship position changes. Currently, the area of interest is handled by the provider we use (HPA). Other providers might need a different interface, with bbox as parameter or something. As we cant assume what other organizations might need, we keep this generic for now.
	 */
	getChangeStream$(): Observable<ShipPositionFeature>;

	getAll(): Promise<ShipPositionFeature[]>;

	search(name: string, limit: number): Promise<ShipPositionFeature[]>;
}
