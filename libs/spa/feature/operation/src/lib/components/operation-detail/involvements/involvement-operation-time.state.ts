import { Injectable } from '@angular/core';

// As we need the operation time for creation of multiple form controls (validators) down the component chain, we need a state to keep track of the operation time
@Injectable()
export class InvolvementOperationTimeState {
	private currentOperationTime?: { start: Date; end: Date | null }; // keep track of operation time for involvement creation

	get operationStart(): Date {
		if (!this.currentOperationTime) {
			throw new Error('Operation time not set');
		}
		return this.currentOperationTime.start;
	}

	get operationEnd(): Date | null {
		if (!this.currentOperationTime) {
			throw new Error('Operation time not set');
		}
		return this.currentOperationTime.end;
	}

	setOperationTime(start: Date, end: Date | null): void {
		this.currentOperationTime = { start, end };
	}
}
