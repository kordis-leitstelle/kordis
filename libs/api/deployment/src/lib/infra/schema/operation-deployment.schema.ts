import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { DeploymentDocumentContract } from './deployment.schema';

@Schema()
export class OperationDeploymentDocument extends DeploymentDocumentContract {
	@Prop()
	operationId: string;
}

export const OperationDeploymentSchema = SchemaFactory.createForClass(
	OperationDeploymentDocument,
);
