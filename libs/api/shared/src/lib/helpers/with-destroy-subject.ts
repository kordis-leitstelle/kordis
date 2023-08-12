import { OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';

export abstract class WithDestroySubject implements OnModuleDestroy {
	protected readonly onDestroySubject = new Subject<void>();

	onModuleDestroy(): void {
		this.onDestroySubject.next();
		this.onDestroySubject.complete();
	}
}
