import {
	ChangeDetectorRef,
	OnDestroy,
	Pipe,
	PipeTransform,
	inject,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { DateChangeService } from '../date-change/date-change.service';

class DateTransformer {
	public transform(date: Date): string {
		const dayDifference = this.calculateDayDifference(new Date(), date);
		switch (true) {
			case dayDifference === 0:
				return this.formatDate(date, 'Heute, ');
			case dayDifference === 1:
				return this.formatDate(date, 'Gestern, ');
			case dayDifference <= 6:
				return this.formatDate(date, '', { weekday: 'long' });
			case dayDifference <= 365:
				return this.formatDate(date, '', { day: '2-digit', month: '2-digit' });
			default:
				return this.formatDate(date, '', {
					day: '2-digit',
					month: '2-digit',
					year: '2-digit',
				});
		}
	}

	/**
	 * Returns the difference in days between two dates. Time is ignored.
	 * The result is positive if the younger (more recent) date is passed at first, else it is negative.
	 */
	private calculateDayDifference(youngerDate: Date, olderDate: Date): number {
		// clone passed dates to avoid modifying them
		const first = new Date(youngerDate);
		const second = new Date(olderDate);

		first.setHours(0, 0, 0, 0);
		second.setHours(0, 0, 0, 0);

		return (first.getTime() - second.getTime()) / (24 * 60 * 60 * 1000);
	}

	private formatDate(
		date: Date,
		prefix: string,
		options?: Intl.DateTimeFormatOptions,
	): string {
		return (
			prefix +
			date.toLocaleString(undefined, {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				...options,
			})
		);
	}
}

@Pipe({
	name: 'krdProtocolEntryTime',
	standalone: true,
	pure: false,
})
export class ProtocolEntryTimePipe implements PipeTransform, OnDestroy {
	private readonly ref = inject(ChangeDetectorRef);
	private readonly dateTransformer = new DateTransformer();
	private readonly dateChangeService = inject(DateChangeService);

	private date?: Date;
	private displayValue = '';
	private dateChangeSubscription?: Subscription;

	ngOnDestroy(): void {
		if (this.dateChangeSubscription) {
			this.dateChangeSubscription.unsubscribe();
		}
	}

	// Since an non-pure pipe is called on every change detection run (which might even be on mouse hover),
	// we need to cache the caculated value to avoid costly recalculations. This is especially true for this pipe
	// since the value changes happen very rarely. See {@link @angular/common/AsyncPipe} for a similar approach.
	transform(date: string): string {
		const parsedDate = new Date(date);
		if (!this.date || this.date !== parsedDate) {
			this.date = parsedDate;
			this.calculateDisplayValue();

			if (!this.dateChangeSubscription) {
				this.initDateChangeSubscription();
			}
		}
		return this.displayValue;
	}

	private initDateChangeSubscription(): void {
		this.dateChangeSubscription = this.dateChangeService.dayChange$.subscribe(
			() => {
				this.calculateDisplayValue();
				this.ref.markForCheck();
			},
		);
	}

	private calculateDisplayValue(): void {
		if (!this.date) {
			throw new Error('Date is not set');
		}
		this.displayValue = this.dateTransformer.transform(this.date);
	}
}
