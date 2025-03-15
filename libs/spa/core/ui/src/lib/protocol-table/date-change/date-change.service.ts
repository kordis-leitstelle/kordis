import { Injectable } from '@angular/core';
import { Observable, map, share, timer } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class DateChangeService {
	dayChange$: Observable<void> = timer(
		this.getMsToNextMidnight(),
		24 * 60 * 60 * 1000,
	).pipe(
		map(() => undefined),
		share(),
	);

	/**
	 * @returns The time in milliseconds until the next midnight.
	 */
	private getMsToNextMidnight(): number {
		const now = new Date();
		const nextMidnight = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 1,
		);
		return nextMidnight.getTime() - now.getTime();
	}
}
