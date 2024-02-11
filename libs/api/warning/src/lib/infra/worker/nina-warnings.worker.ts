import { HttpService } from '@nestjs/axios';
import mongoose from 'mongoose';

import { Warning, WarningSchema } from '../../core/model/warning.model';
import { NinaWarningsChecker } from '../service/nina-warnings-checker';

async function checkAndEmitNewWarnings(
	warningsChecker: NinaWarningsChecker,
): Promise<void> {
	const newWarnings = await warningsChecker.getNewWarnings();
	for (const warning of newWarnings) {
		process.send?.(warning);
	}
}

process.once(
	'message',
	async ({
		mongoUri,
		checkIntervalSec,
		ninaSourcesOfInterest,
	}: {
		mongoUri: string;
		checkIntervalSec: number;
		ninaSourcesOfInterest: string[];
	}) => {
		await mongoose.connect(mongoUri);

		const warningsChecker = new NinaWarningsChecker(
			mongoose.model(Warning.name, WarningSchema),
			ninaSourcesOfInterest,
			new HttpService(),
		);

		const startWorker = async (): Promise<void> => {
			await checkAndEmitNewWarnings(warningsChecker);
			setTimeout(startWorker, 1000 * checkIntervalSec);
		};

		await startWorker();
	},
);
