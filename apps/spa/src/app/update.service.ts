import { Injectable, inject } from '@angular/core';
import { SwUpdate, type VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class UpdateService {
	constructor() {
		// todo: create an interval to check for updates
		inject(SwUpdate)
			.versionUpdates.pipe(
				filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
				filter(() => this.askForUpdatePermission()),
			)
			.subscribe(() => window.location.reload());
	}

	askForUpdatePermission(): boolean {
		// todo: this should be a non-blocking toast notification
		return confirm(
			'Eine neue Version von Kordis ist verfügbar. Möchten Sie die Seite neu laden?',
		);
	}
}
