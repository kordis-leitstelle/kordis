#!/usr/bin/env -S npx ts-node

/*
		This script imports all the data from the `data` folder into a MongoDB database.
		This is mainly used to bootstrap a database for e2es or to start developing on a clean database with just the minimal required data to run Kordis.

		Usage: ts-node import.ts "<MONGO DB CONNECTION URI WITH DB>"
 */
import * as fs from 'fs';
import { Collection, MongoClient } from 'mongodb';
import * as path from 'path';

import { CollectionData } from './data/collection-data.model';

async function loadDataToMongoDB(connUri: string) {
	try {
		const client = await MongoClient.connect(connUri);

		const db = client.db();
		const dataFolderPath = path.join(__dirname, 'data');
		const filenames = fs
			.readdirSync(dataFolderPath)
			.filter((filename) => filename.endsWith('.data.ts'));

		await Promise.all(
			filenames.map(async (filename) => {
				const module = await import(path.join(dataFolderPath, filename));
				const dataModule: CollectionData = module.default;
				const collection: Collection = db.collection(dataModule.collectionName);

				try {
					await collection.insertMany(dataModule.entries);
					console.log(
						`Data imported from ${filename} to collection ${dataModule.collectionName} successfully!`,
					);
				} catch (err) {
					console.error(
						`Failed to import data from ${filename} to collection ${dataModule.collectionName}:`,
						err,
					);
				}
			}),
		);

		await client.close();

		console.log('Done importing.');
	} catch (err) {
		console.error('Failed to connect to MongoDB:', err);
		process.exit(1);
	}
}

const mongoDBConnectionQuery = process.argv[2];
loadDataToMongoDB(mongoDBConnectionQuery);
