import * as amqp from 'amqplib';

import { ShipPosition } from '../../../schema/hpa-ship-position.schema';
import { hpaShipPositionToStorableShipPosition } from './hpa-ship-position-document.mapper';
import { HPAShipPosition } from './hpa-ship-position.model';
import {
	CacheStrategy,
	MongoShipPositionCacheStrategy,
} from './ship-position-cache.strategy';

// todo: move to initial config message
const opts = {
	cert: ``,
	key: ``,
	ca: [``],
};

let cache: CacheStrategy<ShipPosition>;
let connection: amqp.Connection;

/*
 * This worker is responsible for receiving the vessel positions from the HPA and saving them to the cache (currently MongoDB).
 * If a vessel position is received that is already in the cache, the worker checks if the position has changed. If so, the position is updated.
 * We have evaluated that around 40% of the vessel positions published by the HPA do not include any relevant changes, so we try to offload the filter and parsing, as well as the database operations to this worker.
 */

async function start(): Promise<void> {
	const channel = await connection.createChannel();
	await channel.consume(
		'dlrg-vessel-positions',
		async (msg) => {
			if (!msg) {
				return;
			}
			const eventShipPosition = JSON.parse(
				msg.content.toString(),
			) as HPAShipPosition;

			// ignore positions without MMSI, later on we could also implement radar positions
			if (
				!eventShipPosition.vessel?.ais?.mmsi ||
				eventShipPosition.vessel.ais.mmsi === '0'
			) {
				return;
			}

			let storeAndPublish = true;
			// check if cached data is available and changed, only then update since we rely on update events
			const cachedShipPosition = await cache.get(
				eventShipPosition.vessel.ais.mmsi,
			);
			if (cachedShipPosition) {
				const eventShipPositionComparableHash = JSON.stringify({
					...eventShipPosition,
					meta: undefined,
				});
				storeAndPublish =
					eventShipPositionComparableHash !== cachedShipPosition.comparableHash;
			}

			if (storeAndPublish) {
				const publishableShipPosition =
					hpaShipPositionToStorableShipPosition(eventShipPosition);
				await cache.set(
					eventShipPosition.vessel.ais.mmsi,
					publishableShipPosition,
				);
				process.send?.({
					...publishableShipPosition,
					comparableHash: undefined,
				});
			}
		},
		{ noAck: true },
	);
}

process.once('message', async (msg) => {
	if (!msg) {
		throw Error("Couldn't get settings from parent process in initial message");
	}

	const { mongoUri, hpaAmqpUri } = msg as {
		mongoUri: string;
		hpaAmqpUri: string;
	};

	cache = new MongoShipPositionCacheStrategy();
	await cache.init(mongoUri);
	connection = await amqp.connect(hpaAmqpUri, opts);
	void start();
});
