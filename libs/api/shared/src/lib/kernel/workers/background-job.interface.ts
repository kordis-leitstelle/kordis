import { Observable } from 'rxjs';

export interface BackgroundJob<ReturnT> {
	getChangeStream$(): Observable<ReturnT>;
}

export interface DisposableBackgroundJob<ReturnT>
	extends BackgroundJob<ReturnT> {
	[Symbol.dispose](): void;
}
