import { AutoMap } from '@automapper/classes';
import { mongo } from 'mongoose';

import {
	OperationCategoryDocument,
	OperationLocationDocument,
	OperationPatientDocument,
} from '../schema/operation.schema';

export class UpdateOperationDocumentDto {
	@AutoMap()
	isArchived?: boolean;

	@AutoMap()
	sign: string;

	@AutoMap()
	start: Date;

	@AutoMap()
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
