import { Module } from '@nestjs/common';

import { MarkUnitAsInvolvedSaga } from './mark-unit-as-involved.saga';
import { OperationDeploymentSaga } from './operation-deployment.saga';
import { OperationUnitSaga } from './operation-unit.saga';
import { StatusSaga } from './status.saga';

@Module({
	providers: [
		OperationUnitSaga,
		MarkUnitAsInvolvedSaga,
		OperationDeploymentSaga,
		StatusSaga,
	],
})
export class SagasModule {}
