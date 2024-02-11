import { ChildProcess, fork } from 'child_process';
import { WorkerManager } from './worker.manager';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

jest.mock('child_process', () => ({
	fork: jest.fn(),
}));

describe('WorkerManager', () => {
	let mockChildProcess: DeepMocked<ChildProcess>;

	beforeEach(() => {
		mockChildProcess = createMock<ChildProcess>();
		(fork as jest.Mock).mockReturnValue(mockChildProcess);
	});

	it('should create a child process on instantiation', () => {
		new WorkerManager('workerPath');
		expect(fork).toHaveBeenCalledWith(
			expect.stringContaining('workerPath'),
			expect.anything(),
		);
	});

	it('should send config to child process if provided', () => {
		const config = { some: 'config' };
		new WorkerManager('workerPath', config);
		expect(mockChildProcess.send).toHaveBeenCalledWith(config);
	});

	it('should activate stream when connecting', () => {
		return new Promise<void>((done) => {
			const workerManager = new WorkerManager('workerPath');
			const exampleMessage = { some: 'message' };

			workerManager.getChangeStream$().subscribe((msg) => {
				expect(msg).toEqual(exampleMessage);
				done();
			});

			// call the listener fn to emulate process message
			(mockChildProcess.on.mock.calls[0][1] as (msg: any) => any)(
				exampleMessage,
			);
		});
	});

	it('should deactivate stream when disconnecting', () => {
		const workerManager = new WorkerManager('workerPath');
		const subscription = workerManager.getChangeStream$().subscribe();
		subscription.unsubscribe();
		expect(mockChildProcess.removeAllListeners).toHaveBeenCalledWith('message');
	});

	it('should keep stream open if at least on stream is connected', () => {
		const workerManager = new WorkerManager('workerPath');
		const subscription1 = workerManager.getChangeStream$().subscribe();
		workerManager.getChangeStream$().subscribe();
		subscription1.unsubscribe();

		expect(mockChildProcess.removeAllListeners).not.toHaveBeenCalled();
	});
});
