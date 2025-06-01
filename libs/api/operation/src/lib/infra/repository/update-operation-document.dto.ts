import { AutoMap } from '@automapper/classes';
import { mongo } from 'mongoose';

import { OperationProcessState } from '../../core/entity/operation-process-state.enum';
import {
	OperationCategoryDocument,
	OperationLocationDocument,
	OperationPatientDocument,
} from '../schema/operation.schema';

export class UpdateOperationDocumentDto {
	@AutoMap(() => String)
	processState: OperationProcessState;

	@AutoMap()
	sign: string;

	@AutoMap()
	start: Date;

	@AutoMap(() => Date)
	end: Date | undefined;

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

	@AutoMap(() => [OperationCategoryDocument])
	categories: OperationCategoryDocument[];

	@AutoMap()
	location: OperationLocationDocument;

	@AutoMap(() => [OperationPatientDocument])
	patients: OperationPatientDocument[] | mongo.Binary[];
}
