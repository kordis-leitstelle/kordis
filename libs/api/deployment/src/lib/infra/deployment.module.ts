import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SignInRescueStationHandler } from '../core/command/sign-in-rescue-station.command';
import { SignOffRescueStationHandler } from '../core/command/sign-off-rescue-station.command';
import { UpdateSignedInRescueStationHandler } from '../core/command/update-signed-in-rescue-station.command';
import { GetAlertGroupByUnitIdHandler } from '../core/query/get-alert-group-by-unit-id.query';
import { GetUnitAssignmentHandlerHandler } from '../core/query/get-current-assignment-of-entity.query';
import { GetDeploymentsHandler } from '../core/query/get-deployments.query';
import { GetRescueStationDeploymentHandler } from '../core/query/get-rescue-station-deployment.query';
import { GetUnassignedEntitiesHandler } from '../core/query/get-unassigned-entities.query';
import { DEPLOYMENT_ASSIGNMENT_REPOSITORY } from '../core/repository/deployment-assignment.repository';
import { RESCUE_STATION_DEPLOYMENT_REPOSITORY } from '../core/repository/rescue-station-deployment.repository';
import { UNIT_ASSIGNMENT_REPOSITORY } from '../core/repository/unit-assignment.repository';
import { DeploymentAssignmentService } from '../core/service/deployment-assignment.service';
import {
	AlertGroupAssignmentResolver,
	UnitAssignmentResolver,
} from './controller/deployment-assignment.resolver';
import {
	DeploymentAlertGroupResolver,
	DeploymentResolver,
	DeploymentUnitResolver,
	RescueStationDeploymentDefaultUnitsResolver,
} from './controller/deployment.resolver';
import { DeploymentAggregateProfile } from './mapper/deployment-aggregate.mapper-profile';
import { DeploymentAssignmentProfile } from './mapper/deployment-assignment.mapper-profile';
import {
	RescueStationDeploymentAggregateProfile,
	RescueStationDeploymentValueObjectProfile,
} from './mapper/rescue-station-deployment-aggregate.mapper-profile';
import { RescueStationDtoMapperProfile } from './mapper/rescue-station-dto.mapper-profile';
import { DeploymentAssignmentRepositoryImpl } from './repository/assignment/deployment-assignment.repository';
import { UnitAssignmentRepositoryImpl } from './repository/assignment/unit-assignment.repository';
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
	RescueStationDeploymentDocument,
	RescueStationDeploymentSchema,
} from './schema/rescue-station-deployment.schema';

const REPOSITORIES = [
	{
		provide: RESCUE_STATION_DEPLOYMENT_REPOSITORY,
		useClass: RescueStationDeploymentRepositoryImpl,
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
	GetDeploymentsHandler,
	GetRescueStationDeploymentHandler,
	SignInRescueStationHandler,
	SignOffRescueStationHandler,
	UpdateSignedInRescueStationHandler,
	GetUnassignedEntitiesHandler,
	GetAlertGroupByUnitIdHandler,
	GetUnitAssignmentHandlerHandler,
];
const RESOLVERS = [
	DeploymentResolver,
	DeploymentUnitResolver,
	DeploymentAlertGroupResolver,
	UnitAssignmentResolver,
	AlertGroupAssignmentResolver,
	RescueStationDeploymentDefaultUnitsResolver,
];
const MAPPER_PROFILES = [
	DeploymentAggregateProfile,
	DeploymentAssignmentProfile,
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
