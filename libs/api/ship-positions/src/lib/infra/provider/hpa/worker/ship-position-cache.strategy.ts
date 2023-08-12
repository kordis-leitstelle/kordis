import mongoose, { Model } from 'mongoose';

import {
	HPAShipPositionDocument,
	HpaShipPositionSchema,
	ShipPosition,
} from '../../../schema/hpa-ship-position.schema';

export interface CacheStrategy<T> {
	init(...args: unknown[]): Promise<void>;

	get(key: string): Promise<T | null>;

	set(key: string, value: T): Promise<void>;

	getAll(): Promise<T[]>;
}

export class MongoShipPositionCacheStrategy
	implements CacheStrategy<ShipPosition>
{
	private shipPositionModel!: Model<HPAShipPositionDocument>;

	async init(mongoUri: string): Promise<void> {
		await mongoose.connect(mongoUri);
		this.shipPositionModel = mongoose.model(
			HPAShipPositionDocument.name,
			HpaShipPositionSchema,
		);
	}

	get(mmsi: string): Promise<ShipPosition | null> {
		return this.shipPositionModel.findOne({ mmsi }).lean().exec();
	}

	async set(mmsi: string, shipPosition: ShipPosition): Promise<void> {
		await this.shipPositionModel
			.updateOne(
				{ mmsi },
				{
					$set: shipPosition,
				},
				{ upsert: true },
			)
			.exec();
	}

	async getAll(): Promise<ShipPosition[]> {
		return this.shipPositionModel.find().lean().exec();
	}
}
