import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
	ArchiveOperationHandler,
	CreateOperationHandler,
	DeleteOperationHandler,
	SetCompletedOperationInvolvementsHandler,
	StartPendingUnitInvolvementHandler,
	UpdateOperationBaseDataHandler,
} from '../core/command';
import { EndOngoingOperationHandler } from '../core/command/end-ongoing-operation.command';
import { GetOperationByIdHandler } from '../core/query/get-operation-by-id.query';
import { GetOperationIdOfPendingUnitHandler } from '../core/query/get-operation-id-of-pending-unit.query';
import { GetOperationByIdsQueryHandler } from '../core/query/get-operations-by-ids.query';
import { GetOperationsByOrgIdHandler } from '../core/query/get-operations-by-org-id.query';
import { OPERATION_INVOLVEMENT_REPOSITORY } from '../core/repository/operation-involvement.repository';
import { OPERATION_REPOSITORY } from '../core/repository/operation.repository';
import { OPERATION_TEMPLATE_RENDERER } from '../core/service/operation-template.renderer';
import { OperationPdfGenerationService } from '../core/service/pdf/operation-pdf-generation.service';
import { PDF_GENERATION_SERVICE } from '../core/service/pdf/pdf-generation.service';
import { SIGN_GENERATOR } from '../core/service/sign-generator/sign-generator.strategy';
import { YearMonthCounterSignGenerator } from '../core/service/sign-generator/sign-generator/sign-generator/year-month-counter-sign-generator.strategy';
import { OperationInvolvementService } from '../core/service/unit-involvement/operation-involvement.service';
import { OperationsDataLoader } from '../operations.data-loader';
import { OperationPdfController } from './controller/operation-pdf.controller';
import {
	OperationAlertGroupInvolvementResolver,
	OperationUnitInvolvementResolver,
} from './controller/operation-reference.resolver';
import { OperationResolver } from './controller/operation.resolver';
import { OperationDtoProfile } from './mapper/operation-dto.mapper-profile';
import {
	OperationProfile,
	OperationValueObjectsProfile,
} from './mapper/operation.mapper-profile';
import { OperationInvolvementsRepositoryImpl } from './repository/operation-involvements.repository';
import { OperationRepositoryImpl } from './repository/operation.repository';
import {
	OperationInvolvementDocument,
	OperationInvolvementSchema,
} from './schema/operation-involvement.schema';
import { OperationDocument, OperationSchema } from './schema/operation.schema';
import { OperationTemplateRendererImpl } from './service/operation-pdf.renderer';
import { PdfGenerationServiceImpl } from './service/pdf-generation.service';

const RESOLVERS = [
	OperationAlertGroupInvolvementResolver,
	OperationResolver,
	OperationUnitInvolvementResolver,
];
const MAPPER_PROFILES = [
	OperationDtoProfile,
	OperationProfile,
	OperationValueObjectsProfile,
];
const PROVIDERS = [
	{
		provide: OPERATION_REPOSITORY,
		useClass: OperationRepositoryImpl,
	},
	{
		provide: OPERATION_INVOLVEMENT_REPOSITORY,
		useClass: OperationInvolvementsRepositoryImpl,
	},
	{
		provide: SIGN_GENERATOR,
		useClass: YearMonthCounterSignGenerator,
	},
	{
		provide: PDF_GENERATION_SERVICE,
		useClass: PdfGenerationServiceImpl,
	},
	{
		provide: OPERATION_TEMPLATE_RENDERER,
		useClass: OperationTemplateRendererImpl,
	},
	OperationInvolvementService,
	OperationPdfGenerationService,
	OperationsDataLoader,
];
const COMMAND_HANDLERS = [
	ArchiveOperationHandler,
	CreateOperationHandler,
	EndOngoingOperationHandler,
	DeleteOperationHandler,
	StartPendingUnitInvolvementHandler,
	UpdateOperationBaseDataHandler,
	SetCompletedOperationInvolvementsHandler,
];
const QUERY_HANDLERS = [
	GetOperationByIdHandler,
	GetOperationByIdsQueryHandler,
	GetOperationIdOfPendingUnitHandler,
	GetOperationsByOrgIdHandler,
];

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: OperationDocument.name,
				schema: OperationSchema,
			},
			{
				name: OperationInvolvementDocument.name,
				schema: OperationInvolvementSchema,
			},
		]),
	],
	providers: [
		...RESOLVERS,
		...MAPPER_PROFILES,
		...PROVIDERS,
		...COMMAND_HANDLERS,
		...QUERY_HANDLERS,
	],
	controllers: [OperationPdfController],
})
export class OperationModule {}
