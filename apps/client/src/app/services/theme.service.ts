import { Injectable, OnDestroy } from '@angular/core';
import {
	merge,
	Observable,
	ReplaySubject,
	scan,
	shareReplay,
	startWith,
	Subject,
	takeUntil,
} from 'rxjs';

const LS_DARK_MODE_KEY = 'krd-dark-mode';

@Injectable({
	providedIn: 'root',
})
export class ThemeService implements OnDestroy {
	readonly isDark$: Observable<boolean>;

	private readonly toggleDarkModeSubject = new Subject<void>();
	private readonly ngDestroySubject = new ReplaySubject(1);

	constructor() {
		const watchMediaQuery$ = new Observable<boolean>(function (observer) {
			const listener: (
				this: MediaQueryList,
				ev: MediaQueryListEvent,
			) => unknown = (event) => observer.next(event.matches);
			const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

			mediaQueryList.addEventListener('change', listener);

			return () => {
				mediaQueryList.removeEventListener('change', listener);
			};
		});
		const lsValue = localStorage.getItem(LS_DARK_MODE_KEY);
		const startSeed =
			lsValue === 'true' ||
			(window.matchMedia &&
				window.matchMedia('(prefers-color-scheme: dark)').matches &&
				lsValue !== 'false');
		this.isDark$ = merge(
			this.toggleDarkModeSubject.pipe(
				scan((isDarkMode) => !isDarkMode, startSeed),
			),
			watchMediaQuery$,
		).pipe(
			startWith(startSeed),
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
		this.isDark$.pipe(takeUntil(this.ngDestroySubject)).subscribe((isDark) => {
			if (isDark) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}

			localStorage.setItem(LS_DARK_MODE_KEY, isDark.toString());
		});
	}
}
