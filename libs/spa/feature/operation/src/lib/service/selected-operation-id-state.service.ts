import { Injectable, WritableSignal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';


@Injectable()
export class SelectedOperationIdStateService {
	readonly selectedOperationId: WritableSignal<string | null> = signal(null);
	readonly selectedOperationId$ = toObservable(this.selectedOperationId);
}
