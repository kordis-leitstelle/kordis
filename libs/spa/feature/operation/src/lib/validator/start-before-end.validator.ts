import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const startBeforeEndValidator: ValidatorFn = (
	group: AbstractControl<{
		start: Date;
		end: Date | null;
	}>,
): ValidationErrors | null => {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const startDate = group.get('start')!.value;
	const endDate = group.get('end')!.value;
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	if (
		(startDate && (!endDate || startDate < endDate)) ||
		(!startDate && !endDate)
	) {
		return null;
	}

	return { startAfterEnd: true };
};
