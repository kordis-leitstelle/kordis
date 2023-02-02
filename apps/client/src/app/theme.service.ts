import { Injectable, OnDestroy } from '@angular/core';
import {
	Observable,
	ReplaySubject,
	scan,
	shareReplay,
	skip,
	startWith,
	Subject,
	takeUntil,
} from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ThemeService implements OnDestroy {
	readonly isDark$: Observable<boolean>;

	private readonly toggleDarkModeSubject = new Subject<void>();
	private readonly ngDestroySubject = new ReplaySubject(1);

	constructor() {
		this.isDark$ = this.toggleDarkModeSubject.pipe(
			scan((isDarkMode) => !isDarkMode, false),
			startWith(false),
			shareReplay({ bufferSize: 1, refCount: true }),
		);
		this.startWatchingDarkModeState();
	}

	ngOnDestroy(): void {
		this.ngDestroySubject.next(true);
		this.ngDestroySubject.complete();
	}

	toggleDarkMode(): void {
		this.toggleDarkModeSubject.next();
	}

	private startWatchingDarkModeState(): void {
		const htmlTag = document
			.getElementsByTagName('html')
			.item(0) as HTMLHtmlElement;
		this.isDark$
			.pipe(skip(1), takeUntil(this.ngDestroySubject))
			.subscribe((isDark) => {
				if (isDark) {
					htmlTag.classList.add('dark');
				} else {
					htmlTag.classList.remove('dark');
				}
			});
	}
}
