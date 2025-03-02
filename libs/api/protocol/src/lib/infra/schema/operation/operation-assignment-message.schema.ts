import { AutoMap } from '@automapper/classes';
import { ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class OperationMessageAssignedUnitDocument {
	@Prop()
	@AutoMap()
	unitId: string;

	@Prop()
	@AutoMap()
	unitSign: string;

	@Prop()
	@AutoMap()
	unitName: string;
}

@ObjectType()
export class OperationMessageAssignedAlertGroupDocument {
	@Prop()
	@AutoMap()
	alertGroupId: string;

	@Prop()
	@AutoMap()
	alertGroupName: string;

	@Prop()
	@AutoMap(() => [OperationMessageAssignedUnitDocument])
	assignedUnits: OperationMessageAssignedUnitDocument[];
}
