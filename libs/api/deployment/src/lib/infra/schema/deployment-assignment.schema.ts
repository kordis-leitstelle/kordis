import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { BaseDocument } from '@kordis/api/shared';

export enum DeploymentAssignmentType {
	UNIT = 'UNIT',
	ALERT_GROUP = 'ALERT_GROUP',
}

export class DeploymentAssignmentsDocumentContract extends BaseDocument {
	entityId: string;
	deploymentId: Types.ObjectId | null;
	type: string;
}

/*
 * The Deployments Assignments collection is a collection of all units and alert groups with their current assignment status.
 * If an entity is assigned to a deployment, the `deploymentId` field will be set to the deployment id.
 * If the entity is not assigned to a deployment, the `deploymentId` field will be null.
 * The type field indicates whether the entity is a unit or an alert group, whereas the entityId is the original id.
 */

@Schema({
	discriminatorKey: 'type',
	timestamps: true,
	collection: 'deployment-assignments',
})
export class DeploymentAssignmentsDocument
	extends BaseDocument
	implements DeploymentAssignmentsDocumentContract
{
	@Prop({ index: true })
	entityId: string;

	@Prop({ default: null, type: Types.ObjectId, index: true })
	deploymentId: Types.ObjectId | null;

	@Prop({ type: String, enum: Object.values(DeploymentAssignmentType) })
	type: string;
}

export const DeploymentAssignmentSchema = SchemaFactory.createForClass(
	DeploymentAssignmentsDocument,
);

DeploymentAssignmentSchema.index({ orgId: 1, entityId: 1 }, { unique: true });
DeploymentAssignmentSchema.index(
	{ orgId: 1, deploymentId: 1 },
	{ unique: true },
);

@Schema()
export class UnitAssignmentDocument extends DeploymentAssignmentsDocumentContract {
	@Prop({ default: null, type: Types.ObjectId, index: true })
	alertGroupId: string | null;
}

export const UnitAssignmentSchema = SchemaFactory.createForClass(
	UnitAssignmentDocument,
);
UnitAssignmentSchema.index({ orgId: 1, alertGroupId: 1 }, { unique: true });

@Schema()
export class AlertGroupAssignmentDocument extends DeploymentAssignmentsDocumentContract {}

export const AlertGroupAssignmentSchema = SchemaFactory.createForClass(
	AlertGroupAssignmentDocument,
);
