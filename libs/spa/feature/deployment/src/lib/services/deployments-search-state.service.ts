import { signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { share } from 'rxjs';

/*
 * This service is simply used to manage the search state of the deployments search.
 */
export class DeploymentsSearchStateService {
	readonly searchValue = signal('');
	readonly searchValueChange$ = toObservable(this.searchValue).pipe(share());
}
