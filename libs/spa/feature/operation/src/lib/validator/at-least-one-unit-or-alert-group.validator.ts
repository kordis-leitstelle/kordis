import { AbstractControl, FormArray, FormControl } from '@angular/forms';

import { Unit } from '@kordis/shared/model';
import { AlertGroupAssignmentFormGroup } from '@kordis/spa/core/misc';

export const atLeastOneUnitOrAlertGroupValidator: (
	formGroup: AbstractControl,
) => {
	noUnitsOrAlertGroups: boolean;
} | null = (formGroup: AbstractControl) => {
	const units = formGroup.get('units') as FormControl<Unit[]>;
	const alertGroups = formGroup.get(
		'alertGroups',
	) as FormArray<AlertGroupAssignmentFormGroup>;
	if (units.value.length === 0 && alertGroups.length === 0) {
		units.setErrors({ noUnitsOrAlertGroups: true });
		alertGroups.setErrors({ noUnitsOrAlertGroups: true });
		return { noUnitsOrAlertGroups: true };
	}
	units.setErrors(null);
	alertGroups.setErrors(null);

	return null;
};
