import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseDocument } from '@kordis/api/shared';

import { DeploymentType } from './deployment-type.enum';

// we need this class, since the discriminator documents can not extend from DeploymentDocument directly as they inherit the metadata
export abstract class DeploymentDocumentContract
	extends BaseDocument
	implements BaseDeploymentDocument
{
	type: string;
}

@Schema({
	discriminatorKey: 'type',
	timestamps: true,
	collection: 'deployments',
})
export class BaseDeploymentDocument extends BaseDocument {
	@Prop({ type: String, enum: Object.values(DeploymentType) })
	type: string;
}

export const DeploymentSchema = SchemaFactory.createForClass(
	BaseDeploymentDocument,
);
