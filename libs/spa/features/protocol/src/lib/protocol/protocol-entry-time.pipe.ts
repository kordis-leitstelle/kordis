import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';

@Pipe({
	name: 'krdProtocolEntryTime',
	standalone: true,
})
export class ProtocolEntryTimePipe implements PipeTransform {
	private readonly datePipe = inject(DatePipe);

	transform(date: Date): string {
		const today = new Date();

		let format = 'dd.MM.yyyy, HH:mm';
		let prefix = '';
		if (date.toDateString() === today.toDateString()) {
			format = 'HH:mm';
			prefix = 'Heute, ';
		} else if (date.getFullYear() === today.getFullYear()) {
			format = 'dd.MM, HH:mm';
		}

		return prefix + this.datePipe.transform(date, format) ?? date.toString();
	}
}
