import { AutoMap } from '@automapper/classes';

import { OperationProcessState } from '../../entity/operation-process-state.enum';
import {
	OperationCategory,
	OperationLocation,
	OperationPatient,
} from '../../entity/operation.value-objects';

export class UpdateOperationDto {
	@AutoMap(() => String)
	processState: OperationProcessState;

	@AutoMap()
	start: Date;

	@AutoMap(() => Date)
	end?: Date | null;

	@AutoMap()
	commander: string;

	@AutoMap()
	reporter: string;

	@AutoMap()
	alarmKeyword: string;

	@AutoMap()
	description: string;

	@AutoMap()
	externalReference: string;

	@AutoMap(() => [OperationCategory])
	categories: OperationCategory[];

	@AutoMap()
	location: OperationLocation;

	@AutoMap(() => [OperationPatient])
	patients: OperationPatient[];
}
