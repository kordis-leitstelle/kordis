import { classes } from '@automapper/classes';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AutomapperModule } from '@timonmasberg/automapper-nestjs';
import { Model, Types } from 'mongoose';
import { Observable, first, lastValueFrom } from 'rxjs';

import { HPAShipPositionDocument } from '../../schema/hpa-ship-position.schema';
import { ShipPositionMapperProfile } from '../../ship-position.mapper-profile';
import { HpaShipPositionsService } from './hpa-ship-positions.service';

const childProcessInstanceMock = {
	on: jest.fn(),
	send: jest.fn(),
	removeAllListeners: jest.fn(),
};
jest.mock('child_process', () => ({
	fork: jest.fn(() => childProcessInstanceMock),
}));

const EXAMPLE_DOCUMENT = Object.freeze({
	_id: new Types.ObjectId('64ca4a2645589c7ea0a520ba'),
	mmsi: '211896540',
	__v: 0,
	callSign: 'DH9852',
	class: 'PassengerShip',
	cog: 0,
	comparableHash: 'hash',
	createdAt: new Date('2023-08-02T12:24:02.000+0000'),
	heading: 117.99865722656251,
	latitude: 53.54256212711335,
	length: 41,
	longitude: 9.978541731834412,
	name: 'KLEIN HEINI',
	sog: 0,
	subClass: 'AllTypes',
	turningRate: 0,
	width: 7.6,
});

const EXAMPLE_FEATURE = Object.freeze({
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
});

describe('HpaShipPositionsService', () => {
	let service: HpaShipPositionsService;
	let model: DeepMocked<Model<HPAShipPositionDocument>>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				ShipPositionMapperProfile,
				HpaShipPositionsService,
				{
					provide: getModelToken('HPAShipPositionDocument'),
					useValue: createMock<Model<HPAShipPositionDocument>>(),
				},
			],
		}).compile();

		service = module.get<HpaShipPositionsService>(HpaShipPositionsService);
		model = module.get<DeepMocked<Model<HPAShipPositionDocument>>>(
			getModelToken('HPAShipPositionDocument'),
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return documents as geojson features', async () => {
		model.find.mockReturnValue({
			lean: jest.fn().mockReturnValue({
				exec: jest.fn().mockResolvedValueOnce([EXAMPLE_DOCUMENT]),
			}),
		} as any);

		const result = await service.getAll();

		expect(result).toEqual([EXAMPLE_FEATURE]);
	});

	it('getChangeStream$ Observable should emit GeoJSON Feature on child process message', async () => {
		const result = service.getChangeStream$();

		expect(result).toBeInstanceOf(Observable);
		expect(childProcessInstanceMock.on.mock.lastCall[0]).toBe('message');
		childProcessInstanceMock.on.mock.lastCall[1]({
			mmsi: '211896540',
			callSign: 'DH9852',
			class: 'PassengerShip',
			cog: 0,
			comparableHash: 'hash',
			createdAt: new Date('2023-08-02T12:24:02.000+0000'),
			heading: 117.99865722656251,
			latitude: 53.54256212711335,
			length: 41,
			longitude: 9.978541731834412,
			name: 'KLEIN HEINI',
			sog: 0,
			subClass: 'AllTypes',
			turningRate: 0,
			width: 7.6,
		});

		// take first value, unsubscribe
		await expect(lastValueFrom(result.pipe(first()))).resolves.toEqual(
			EXAMPLE_FEATURE,
		);

		// expect to only listen to events when there is an active subscription
		expect(childProcessInstanceMock.removeAllListeners).toHaveBeenCalledWith(
			'message',
		);
	});

	it('should call the model find method with the correct parameters', async () => {
		const limitFnMock = jest.fn();

		model.find.mockReturnValue({
			limit: limitFnMock.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValueOnce([EXAMPLE_DOCUMENT]),
				}),
			}),
		} as any);

		const result = await service.search('query', 5);

		expect(limitFnMock).toHaveBeenCalledWith(5);
		expect(model.find).toHaveBeenCalledWith({
			$or: [
				{ $text: { $search: 'query' } },
				{ name: { $regex: 'query', $options: 'i' } },
				{ mmsi: { $regex: 'query', $options: 'i' } },
				{ callSign: { $regex: 'query', $options: 'i' } },
			],
		});
		expect(result).toEqual([EXAMPLE_FEATURE]);
	});
});
