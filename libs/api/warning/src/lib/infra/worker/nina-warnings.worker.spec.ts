import { ChildProcess, fork } from 'child_process';
import { WorkerManager } from '@kordis/api/shared';
import { Warning } from '../../core/model/warning.model';
import { NinaWarningsChecker } from '../service/nina-warnings-checker';

jest.mock('child_process', () => ({
	fork: jest.fn(),
}));

jest.mock('mongoose', () => ({
	Document: class {},
	SchemaFactory: {
		createForClass: jest.fn(),
	},
	Schema: class {},
	connect: jest.fn(),
	model: jest.fn().mockReturnValue({
		findOne: jest.fn(),
		create: jest.fn(),
		replaceOne: jest.fn(),
		exec: jest.fn(),
	}),
}));

jest.mock('../service/nina-warnings-checker');

describe('NinaWarningsWorker', () => {
	let mockChildProcess: ChildProcess;
	let mockNinaWarningsChecker: jest.Mocked<NinaWarningsChecker>;

	beforeEach(() => {
		mockChildProcess = {
			send: jest.fn(),
			on: jest.fn(),
		} as any;
		(fork as jest.Mock).mockReturnValue(mockChildProcess);

		mockNinaWarningsChecker = new NinaWarningsChecker(
			null as any,
			[],
			null as any,
		) as jest.Mocked<NinaWarningsChecker>;
	});

	it('should initialize worker process with a message', () => {
		const config = {
			mongoUri: 'testUri',
			checkIntervalSec: 10,
			ninaSourcesOfInterest: ['testSource'],
		};
		new WorkerManager('workers/nina-warnings.worker.js', config);
		expect(fork).toHaveBeenCalledWith(
			expect.stringContaining('workers/nina-warnings.worker.js'),
			expect.anything(),
		);
		expect(mockChildProcess.send).toHaveBeenCalledWith(config);
	});

	it('should emit new warnings', () =>
		new Promise<void>((done) => {
			const warning = new Warning();
			warning.description = 'test warning';
			mockNinaWarningsChecker.getNewWarnings.mockResolvedValue([warning]);

			const workerManager = new WorkerManager(
				'workers/nina-warnings.worker.js',
			);

			workerManager.getChangeStream$().subscribe((msg) => {
				expect(msg).toEqual(warning);
				done();
			});

			// call the listener fn to emulate process message
			(mockChildProcess.on as jest.Mock).mock.calls[0][1](warning);
		}));
});
