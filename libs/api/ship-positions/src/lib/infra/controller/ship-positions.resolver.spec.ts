import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import { AuthUser } from '@kordis/shared/auth';

import { ShipPositionFeature } from '../../core/entity/ship-position.entity';
import {
	SHIP_POSITIONS_SERVICE_PROVIDER,
	ShipPositionsServiceProvider,
} from '../../core/service/ship-positions-service.provider';
import { ShipPositionsService } from '../../core/service/ship-positions.service';
import { ShipPositionsResolver } from './ship-positions.resolver';

describe('ShipPositionsResolver', () => {
	let resolver: ShipPositionsResolver;
	let shipPositionsServiceProvider: DeepMocked<ShipPositionsServiceProvider>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ShipPositionsResolver,
				{
					provide: SHIP_POSITIONS_SERVICE_PROVIDER,
					useValue: createMock<ShipPositionsServiceProvider>(),
				},
			],
		}).compile();

		resolver = module.get<ShipPositionsResolver>(ShipPositionsResolver);
		shipPositionsServiceProvider = module.get<
			DeepMocked<ShipPositionsServiceProvider>
		>(SHIP_POSITIONS_SERVICE_PROVIDER);
	});

	it('should connect to mongodb on init', async () => {});

	it('should return ship positions', async () => {
		const mockShipPositions: ShipPositionFeature[] = [
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [9.978541731834412, 53.54256212711335],
				},
				properties: {
					mmsi: '211896540',
					callSign: 'DH9852',
					class: 'PassengerShip',
					cog: 0,
					createdAt: new Date('2023-08-02T12:24:02.000+0000'),
					heading: 117.99865722656251,
					length: 41,
					name: 'KLEIN HEINI',
					sog: 0,
					subClass: 'AllTypes',
					turningRate: 0,
					width: 7.6,
				},
			},
		];

		const mockShipPositionsService = createMock<ShipPositionsService>({
			getAll: jest.fn().mockResolvedValue(mockShipPositions),
		});

		shipPositionsServiceProvider.forOrg.mockResolvedValueOnce(
			mockShipPositionsService,
		);

		const result = await resolver.shipPositions({
			organization: 'orgId',
		} as AuthUser);

		expect(result).toEqual(mockShipPositions);
	});

	it('should return filtered ship positions', async () => {
		const mockShipPositions: ShipPositionFeature[] = [
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [9.978541731834412, 53.54256212711335],
				},
				properties: {
					mmsi: '211896540',
					callSign: 'DH9852',
					class: 'PassengerShip',
					cog: 0,
					createdAt: new Date('2023-08-02T12:24:02.000+0000'),
					heading: 117.99865722656251,
					length: 41,
					name: 'KLEIN HEINI',
					sog: 0,
					subClass: 'AllTypes',
					turningRate: 0,
					width: 7.6,
				},
			},
		];
		const mockQuery = 'Ship Name';
		const mockLimit = 1;

		const mockShipPositionsService = createMock<ShipPositionsService>({
			search: jest.fn().mockResolvedValue(mockShipPositions),
		});

		shipPositionsServiceProvider.forOrg.mockResolvedValueOnce(
			mockShipPositionsService,
		);

		const result = await resolver.findShips(
			{ organization: 'orgId' } as AuthUser,
			mockQuery,
			mockLimit,
		);

		expect(result).toEqual(mockShipPositions);
		expect(mockShipPositionsService.search).toHaveBeenCalledWith(
			mockQuery,
			mockLimit,
		);
	});

	it('should emit feature if stream Observable emits', async () => {
		const feature: ShipPositionFeature = {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [9.978541731834412, 53.54256212711335],
			},
			properties: {
				mmsi: '211896540',
				callSign: 'DH9852',
				class: 'PassengerShip',
				cog: 0,
				createdAt: new Date('2023-08-02T12:24:02.000+0000'),
				heading: 117.99865722656251,
				length: 41,
				name: 'KLEIN HEINI',
				sog: 0,
				subClass: 'AllTypes',
				turningRate: 0,
				width: 7.6,
			},
		};

		const mockShipPositionsService = createMock<ShipPositionsService>({
			getChangeStream$: jest.fn().mockReturnValueOnce(of(feature)),
		});

		shipPositionsServiceProvider.forOrg.mockResolvedValueOnce(
			mockShipPositionsService,
		);

		const result = await resolver.shipPositionChanged({
			organization: 'orgId',
		} as AuthUser);

		await expect(result.next()).resolves.toEqual({
			done: false,
			value: feature,
		});
	});
});
