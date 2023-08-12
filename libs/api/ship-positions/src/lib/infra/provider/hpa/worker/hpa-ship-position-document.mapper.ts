import { ShipPosition } from '../../../schema/hpa-ship-position.schema';
import { HPAShipPosition } from './hpa-ship-position.model';

export function hpaShipPositionToStorableShipPosition(
	hpaShipPosition: HPAShipPosition,
): ShipPosition {
	return {
		createdAt: new Date(hpaShipPosition.meta.timestamp),
		callSign: hpaShipPosition.vessel.ais.callsign,
		class: hpaShipPosition.vessel.ais.vesselClass,
		subClass: hpaShipPosition.vessel.ais.vesselSubClass,
		length: hpaShipPosition.vessel.ais.length,
		width: hpaShipPosition.vessel.ais.width,
		turningRate: hpaShipPosition.position.turningRate ?? 0,
		sog: hpaShipPosition.position.sog,
		cog: hpaShipPosition.position.cog,
		heading: hpaShipPosition.position.heading,
		latitude: hpaShipPosition.position.lat,
		longitude: hpaShipPosition.position.lon,
		mmsi: hpaShipPosition.vessel.ais.mmsi,
		name: hpaShipPosition.vessel.ais.name,
		// remove meta, as timestamp would always change the comparable hash
		comparableHash: JSON.stringify({
			...hpaShipPosition,
			meta: undefined,
		}),
	};
}
