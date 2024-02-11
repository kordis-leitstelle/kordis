import { ChildProcess, fork, Serializable } from 'child_process';
import { join as joinPath } from 'path';
import {
	distinctUntilChanged,
	finalize,
	map,
	Observable,
	scan,
	share,
	Subject,
	takeUntil,
} from 'rxjs';
import { DisposableBackgroundJob } from './background-job.interface';

/**
 * Manages a child process worker that can send data to the parent process which gets populated via change stream (`getChangeStream$`).
 * Internally, the class only listens to events emitted from the worker when at least one change stream is active.
 *
 * @template ConfigT - The type of the worker config initially send to the worker.
 * @template ReturnT - The type of the data emitted by the worker.
 */
export class WorkerManager<
	ConfigT extends Serializable,
	ReturnT extends Serializable,
> implements DisposableBackgroundJob<ReturnT>
{
	private readonly workerProcess: ChildProcess;
	private readonly abortController = new AbortController();
	private readonly onDestroySubject = new Subject<void>();
	private readonly connectionCounterSubject = new Subject<'up' | 'down'>();
	private readonly newProcessEmissionSubject = new Subject<ReturnT>();
	private readonly newProcessEmission$: Observable<ReturnT> =
		this.newProcessEmissionSubject.pipe(share());

	constructor(
		pathToWorker: string,
		private readonly config?: ConfigT,
	) {
		this.workerProcess = fork(joinPath(__dirname, pathToWorker), {
			signal: this.abortController.signal,
		});

		if (config) {
			this.workerProcess.send(config);
		}

		this.connectionCounterSubject
			.pipe(
				scan(
					(count: number, command: 'up' | 'down') =>
						command === 'up' ? count + 1 : count - 1,
					0,
				),
				map((count) => count > 0),
				distinctUntilChanged(),
				map((activateStream) =>
					activateStream ? this.activateStream : this.deactivateStream,
				),
				takeUntil(this.onDestroySubject),
			)
			.subscribe((action) => action.bind(this)());
	}

	[Symbol.dispose](): void {
		this.workerProcess.removeAllListeners();
		this.abortController.abort();

		this.onDestroySubject.next();
		this.onDestroySubject.complete();
	}

	getChangeStream$(): Observable<ReturnT> {
		this.connectionCounterSubject.next('up');
		return this.newProcessEmission$.pipe(
			finalize(() => this.connectionCounterSubject.next('down')),
		);
	}

	private activateStream(): void {
		this.workerProcess.on('message', (msg: ReturnT) =>
			this.newProcessEmissionSubject.next(msg),
		);
	}

	private deactivateStream(): void {
		this.workerProcess.removeAllListeners('message');
	}
}
