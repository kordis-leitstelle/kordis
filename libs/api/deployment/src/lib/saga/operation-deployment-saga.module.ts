import { Module } from '@nestjs/common';

import { OperationDeploymentSaga } from './operation-deployment.saga';

@Module({
	providers: [OperationDeploymentSaga],
})
export class OperationDeploymentSagaModule {}
