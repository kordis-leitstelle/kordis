import { Module } from '@nestjs/common';

import { MarkUnitAsInvolvedSaga } from './mark-unit-as-involved.saga';


@Module({
	providers: [MarkUnitAsInvolvedSaga],
})
export class OperationSagaModule {}
