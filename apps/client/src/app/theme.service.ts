import { Injectable } from '@angular/core';
import { Observable, scan, shareReplay, startWith, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	isDark$: Observable<boolean>;

	private readonly toggleDarkModeSubject = new Subject<void>();

	constructor() {
		this.isDark$ = this.toggleDarkModeSubject.pipe(
			scan((isDarkMode) => !isDarkMode, false),
			startWith(false),
			shareReplay({ bufferSize: 1, refCount: true }),
		);
	}

	toggleDarkMode(): void {
		this.toggleDarkModeSubject.next();
	}
}
