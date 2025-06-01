import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateOperationDeploymentHandler } from '../core/command/operation/create-operation-deployment.command';
import { RemoveOperationDeploymentHandler } from '../core/command/operation/remove-operation-deployment.command';
import { SetOperationDeploymentAssignmentsHandler } from '../core/command/operation/set-operation-deployment-assignments.command';
import { ResetRescueStationsHandler } from '../core/command/rescue-station/reset-rescue-stations.command';
import { SignInRescueStationHandler } from '../core/command/rescue-station/sign-in-rescue-station.command';
import { SignOffRescueStationHandler } from '../core/command/rescue-station/sign-off-rescue-station.command';
import { UpdateRescueStationNoteHandler } from '../core/command/rescue-station/update-rescue-station-note.command';
import { UpdateSignedInRescueStationHandler } from '../core/command/rescue-station/update-signed-in-rescue-station.command';
import { GetAlertGroupAssignedUnitsHandler } from '../core/query/get-alert-group-assigned-units.query';
import { GetAlertGroupByUnitIdHandler } from '../core/query/get-alert-group-by-unit-id.query';
import { GetUnitAssignmentHandlerHandler } from '../core/query/get-current-assignment-of-entity.query';
import { GetOperationDeploymentByIdHandler } from '../core/query/get-operation-deployment-by-id.query';
import { GetOperationDeploymentsHandler } from '../core/query/get-operation-deployments.query';
import { GetRescueStationDeploymentHandler } from '../core/query/get-rescue-station-deployment.query';
import { GetRescueStationsDeploymentsHandler } from '../core/query/get-rescue-station-deployments.query';
import { GetUnassignedEntitiesHandler } from '../core/query/get-unassigned-entities.query';
import { DEPLOYMENT_ASSIGNMENT_REPOSITORY } from '../core/repository/deployment-assignment.repository';
import { OPERATION_DEPLOYMENT_REPOSITORY } from '../core/repository/operation-deployment.repository';
import { RESCUE_STATION_DEPLOYMENT_REPOSITORY } from '../core/repository/rescue-station-deployment.repository';
import { UNIT_ASSIGNMENT_REPOSITORY } from '../core/repository/unit-assignment.repository';
import { DeploymentAssignmentService } from '../core/service/deployment-assignment.service';
import {
	AlertGroupAssignmentResolver,
	UnassignedEntitiesResolver,
	UnitAssignmentResolver,
} from './controller/deployment-assignment.resolver';
import {
	DeploymentAlertGroupResolver,
	DeploymentUnitResolver,
} from './controller/deployment-unit.resolver';
import {
	EntityOperationAssignmentResolver,
	OperationDeploymentResolver,
} from './controller/operation-deployment.resolver';
import {
	RescueStationDeploymentDefaultUnitsResolver,
	RescueStationDeploymentResolver,
} from './controller/rescue-station-deployment.resolver';
import { DeploymentAggregateProfile } from './mapper/deployment-aggregate.mapper-profile';
import { DeploymentAssignmentProfile } from './mapper/deployment-assignment.mapper-profile';
import { OperationDeploymentAggregateProfile } from './mapper/operation-deployment-aggregate.mapper-profile';
import {
	RescueStationDeploymentAggregateProfile,
	RescueStationDeploymentValueObjectProfile,
} from './mapper/rescue-station-deployment-aggregate.mapper-profile';
import { RescueStationDtoMapperProfile } from './mapper/rescue-station-dto.mapper-profile';
import { DeploymentAssignmentRepositoryImpl } from './repository/assignment/deployment-assignment.repository';
import { UnitAssignmentRepositoryImpl } from './repository/assignment/unit-assignment.repository';
import { OperationDeploymentRepositoryImpl } from './repository/deployment/operation-deployment.repository';
import { RescueStationDeploymentRepositoryImpl } from './repository/deployment/rescue-station-deployment.repository';
import {
	AlertGroupAssignmentDocument,
	AlertGroupAssignmentSchema,
	DeploymentAssignmentSchema,
	DeploymentAssignmentType,
	DeploymentAssignmentsDocument,
	UnitAssignmentDocument,
	UnitAssignmentSchema,
} from './schema/deployment-assignment.schema';
import { DeploymentType } from './schema/deployment-type.enum';
import {
	BaseDeploymentDocument,
	DeploymentSchema,
} from './schema/deployment.schema';
import {
	OperationDeploymentDocument,
	OperationDeploymentSchema,
} from './schema/operation-deployment.schema';
import {
	RescueStationDeploymentDocument,
	RescueStationDeploymentSchema,
} from './schema/rescue-station-deployment.schema';

const REPOSITORIES = [
	{
		provide: RESCUE_STATION_DEPLOYMENT_REPOSITORY,
		useClass: RescueStationDeploymentRepositoryImpl,
	},
	{
		provide: OPERATION_DEPLOYMENT_REPOSITORY,
		useClass: OperationDeploymentRepositoryImpl,
	},
	{
		provide: DEPLOYMENT_ASSIGNMENT_REPOSITORY,
		useClass: DeploymentAssignmentRepositoryImpl,
	},
	{
		provide: UNIT_ASSIGNMENT_REPOSITORY,
		useClass: UnitAssignmentRepositoryImpl,
	},
];
const CQRS_HANDLERS = [
	CreateOperationDeploymentHandler,
	GetAlertGroupAssignedUnitsHandler,
	GetAlertGroupByUnitIdHandler,
	GetOperationDeploymentByIdHandler,
	GetOperationDeploymentsHandler,
	GetRescueStationDeploymentHandler,
	GetRescueStationsDeploymentsHandler,
	GetUnassignedEntitiesHandler,
	GetUnitAssignmentHandlerHandler,
	RemoveOperationDeploymentHandler,
	ResetRescueStationsHandler,
	SetOperationDeploymentAssignmentsHandler,
	SignInRescueStationHandler,
	SignOffRescueStationHandler,
	UpdateRescueStationNoteHandler,
	UpdateSignedInRescueStationHandler,
];
const RESOLVERS = [
	AlertGroupAssignmentResolver,
	DeploymentAlertGroupResolver,
	DeploymentUnitResolver,
	EntityOperationAssignmentResolver,
	OperationDeploymentResolver,
	RescueStationDeploymentDefaultUnitsResolver,
	RescueStationDeploymentResolver,
	UnassignedEntitiesResolver,
	UnitAssignmentResolver,
];
const MAPPER_PROFILES = [
	DeploymentAggregateProfile,
	DeploymentAssignmentProfile,
	OperationDeploymentAggregateProfile,
	RescueStationDeploymentAggregateProfile,
	RescueStationDeploymentValueObjectProfile,
	RescueStationDtoMapperProfile,
];
const DOMAIN_SERVICES = [DeploymentAssignmentService];

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: BaseDeploymentDocument.name,
				schema: DeploymentSchema,
				discriminators: [
					{
						value: DeploymentType.RESCUE_STATION,
						name: RescueStationDeploymentDocument.name,
						schema: RescueStationDeploymentSchema,
					},
					{
						value: DeploymentType.OPERATION,
						name: OperationDeploymentDocument.name,
						schema: OperationDeploymentSchema,
					},
				],
			},
			{
				name: DeploymentAssignmentsDocument.name,
				schema: DeploymentAssignmentSchema,
				discriminators: [
					{
						value: DeploymentAssignmentType.UNIT,
						name: UnitAssignmentDocument.name,
						schema: UnitAssignmentSchema,
					},
					{
						value: DeploymentAssignmentType.ALERT_GROUP,
						name: AlertGroupAssignmentDocument.name,
						schema: AlertGroupAssignmentSchema,
					},
				],
			},
		]),
	],
	providers: [
		...REPOSITORIES,
		...CQRS_HANDLERS,
		...RESOLVERS,
		...MAPPER_PROFILES,
		...DOMAIN_SERVICES,
	],
})
export class DeploymentModule {}
