import mongoose from 'mongoose';

import { ShipPosition } from '../../../schema/hpa-ship-position.schema';
import {
	CacheStrategy,
	MongoShipPositionCacheStrategy,
} from './ship-position-cache.strategy';

describe('MongoShipPositionCacheStrategy', () => {
	let cacheStrategy: CacheStrategy<ShipPosition>;
	let connectSpy: jest.SpyInstance;
	const uri = 'mongodb://localhost:27017/ship-positions';
	beforeAll(async () => {
		cacheStrategy = new MongoShipPositionCacheStrategy();
		connectSpy = jest.spyOn(mongoose, 'connect');
		connectSpy.mockImplementationOnce(() => Promise.resolve(mongoose));
		await cacheStrategy.init(uri);
	});

	it('should call connect on init', async () => {
		expect(connectSpy).toHaveBeenCalledWith(uri);
	});

	it('should call findOne', async () => {
		const mmsi = '123456789';
		const shipPosition = {
			mmsi,
			latitude: 10,
			longitude: 20,
		} as ShipPosition;

		const findOneSpy = jest
			.spyOn(mongoose.Model, 'findOne')
			.mockImplementationOnce(
				() =>
					({
						lean: () => ({
							exec: () => Promise.resolve(shipPosition),
						}),
					} as any),
			);

		// Get the data from the cache
		const retrievedPosition = await cacheStrategy.get(mmsi);
		expect(findOneSpy).toHaveBeenCalledWith({ mmsi });
		// Assert that the retrieved data matches the original data
		expect(retrievedPosition).toEqual(shipPosition);
	});

	it('should call updateOne with upsert', async () => {
		const updateOneSpy = jest
			.spyOn(mongoose.Model, 'updateOne')
			.mockImplementationOnce(
				() =>
					({
						exec: () => Promise.resolve(),
					} as any),
			);

		await cacheStrategy.set('123456789', {
			mmsi: '987655321',
		} as ShipPosition);
		expect(updateOneSpy).toHaveBeenCalledWith(
			{ mmsi: '123456789' },
			{
				$set: {
					mmsi: '987655321',
				},
			},
			{ upsert: true },
		);
	});

	it('should call find', async () => {
		const shipPositions = [
			{
				mmsi: '123456789',
				latitude: 10,
				longitude: 20,
			} as ShipPosition,
		];

		const findSpy = jest.spyOn(mongoose.Model, 'find').mockImplementationOnce(
			() =>
				({
					lean: () => ({
						exec: () => Promise.resolve(shipPositions),
					}),
				} as any),
		);

		const allPositions = await cacheStrategy.getAll();

		// Assert that all data is retrieved
		expect(allPositions).toEqual(shipPositions);
		expect(findSpy).toHaveBeenCalled();
	});
});
