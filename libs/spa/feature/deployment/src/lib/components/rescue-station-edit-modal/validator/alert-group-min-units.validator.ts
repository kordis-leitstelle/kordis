import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';

import { AlertGroupAssignmentFormGroup } from '../rescue-station-edit-modal.component';

export const alertGroupMinUnitsValidator = (
	control: AbstractControl,
): ValidationErrors | null => {
	const array = control as FormArray<AlertGroupAssignmentFormGroup>;

	for (const group of array.controls) {
		if (group.controls.assignedUnits.value.length === 0) {
			group.controls.assignedUnits.setErrors({ minUnitsInvalid: true });
			return { minUnitsInvalid: true };
		}
	}

	return null;
};
