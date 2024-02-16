import { Injectable } from '@angular/core';
import { Observable, map, share, timer } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class DayChangeService {
	dayChangeObservable$: Observable<void> = timer(
		this.calculateTimeToNextMidnight(),
		86400000,
	).pipe(
		map(() => undefined),
		share(),
	);

	private calculateTimeToNextMidnight(): number {
		const now = new Date();
		const nextMidnight = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 1,
		);
		return nextMidnight.getTime() - now.getTime();
	}
}
