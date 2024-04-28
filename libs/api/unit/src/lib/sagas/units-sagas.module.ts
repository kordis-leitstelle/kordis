import { Module } from '@nestjs/common';

import { StatusSaga } from './status.saga';

@Module({
	providers: [StatusSaga],
})
export class UnitsSagaModule {}
