import { FormControl, FormGroup } from '@angular/forms';

import { AlertGroup, Unit } from '@kordis/shared/model';

export type AlertGroupAssignmentFormGroup = FormGroup<{
	alertGroup: FormControl<AlertGroup>;
	assignedUnits: FormControl<Unit[]>;
}>;
