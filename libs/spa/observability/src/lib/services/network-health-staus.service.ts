import { Injectable } from '@angular/core';
import {
	Observable,
	fromEvent,
	map,
	merge,
	shareReplay,
	startWith,
} from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class NetworkHealthStatusService {
	readonly statusChanged$: Observable<boolean> = merge(
		fromEvent(window, 'online').pipe(map(() => true)),
		fromEvent(window, 'offline').pipe(map(() => false)),
	).pipe(
		startWith(navigator.onLine),
		shareReplay({ bufferSize: 1, refCount: true }),
	);
}
