#!/usr/bin/env -S npx ts-node
import { mongoMigrateCli } from 'mongo-migrate-ts';

mongoMigrateCli({
	uri: process.env.MONGODB_URI,
	database: process.env.MONGODB_DB,
	migrationsDir: __dirname,
	migrationsCollection: 'migrations',
});
