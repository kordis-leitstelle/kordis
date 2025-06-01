import { filter, pairwise, pipe, startWith, tap } from 'rxjs';

import { Unit } from '@kordis/shared/model';
import { PossibleUnitSelectionsService } from '@kordis/spa/core/ui';

export const ensureSingleUnitSelectionPipe = (
	unitService: PossibleUnitSelectionsService,
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) =>
	pipe(
		startWith(null),
		pairwise(),
		filter(([prev, curr]) => prev !== curr && !!curr),
		tap(([prev, curr]) => {
			if (curr && typeof curr !== 'string') {
				unitService.markAsSelected(curr as Unit);
				if (prev && typeof prev !== 'string') {
					unitService.unmarkAsSelected(prev as Unit);
				}
			}
		}),
	);
