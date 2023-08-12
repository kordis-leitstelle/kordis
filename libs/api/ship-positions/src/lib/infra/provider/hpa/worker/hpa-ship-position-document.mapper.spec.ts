import { ShipPosition } from '../../../schema/hpa-ship-position.schema';
import { hpaShipPositionToStorableShipPosition } from './hpa-ship-position-document.mapper';
import { HPAShipPosition } from './hpa-ship-position.model';

describe('hpaShipPositionToStorableShipPosition', () => {
	it('should map ship position model from HPA to document', () => {
		const hpaShipPosition: HPAShipPosition = {
			meta: {
				timestamp: '2023-08-03T12:34:56Z',
			},
			aissupport: true,
			radarsupport: true,
			position: {
				ais: {
					navigationalStatus: 'SomeStatus',
					sog: 10,
				},
				cog: 90,
				heading: 100,
				lat: 35.1234,
				lon: -120.5678,
				sog: 11,
				turningRate: 5,
			},
			vessel: {
				ais: {
					callsign: 'ABCD',
					length: 100,
					width: 20,
					mmsi: '123456789',
					name: 'Test Ship',
					navigationalStatus: 'SmeStatus',
					vesselClass: 'CargoShip',
					vesselSubClass: 'BulkCarrier',
				},
			},
		};

		const expectedStorableShipPosition: ShipPosition = {
			createdAt: new Date('2023-08-03T12:34:56Z'),
			callSign: 'ABCD',
			class: 'CargoShip',
			subClass: 'BulkCarrier',
			length: 100,
			width: 20,
			turningRate: 5,
			sog: 11,
			cog: 90,
			heading: 100,
			latitude: 35.1234,
			longitude: -120.5678,
			mmsi: '123456789',
			name: 'Test Ship',
			comparableHash: JSON.stringify({
				...hpaShipPosition,
				meta: undefined,
			}),
		};

		const storableShipPosition =
			hpaShipPositionToStorableShipPosition(hpaShipPosition);

		expect(storableShipPosition).toEqual(expectedStorableShipPosition);
	});
});
