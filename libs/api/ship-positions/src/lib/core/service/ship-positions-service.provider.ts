import { ShipPositionsService } from './ship-positions.service';

export const SHIP_POSITIONS_SERVICE_PROVIDER = Symbol(
	'SHIP_POSITION_SERVICE_PROVIDER',
);

// Facade for the different ship position providers, as organizations can choose their provider dynamically
export interface ShipPositionsServiceProvider {
	forOrg(orgId: string): Promise<ShipPositionsService>;
}
