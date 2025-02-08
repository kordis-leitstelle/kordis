import { Controller, Get, Param, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';

import { RequestUser } from '@kordis/api/auth';
import { AuthUser } from '@kordis/shared/model';

import { OperationEntity } from '../../core/entity/operation.entity';
import { GetOperationByIdQuery } from '../../core/query/get-operation-by-id.query';
import { OperationPdfGenerationService } from '../../core/service/pdf/operation-pdf-generation.service';

@Controller('operation')
export class OperationPdfController {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly operationPdfGenerationService: OperationPdfGenerationService,
	) {}

	@Get(':operationId.pdf')
	async getPdf(
		@RequestUser() authUser: AuthUser,
		@Param('operationId')
		operationId: string,
		@Res() res: Response,
	): Promise<void> {
		const operation: OperationEntity = await this.queryBus.execute(
			new GetOperationByIdQuery(authUser.organizationId, operationId),
		);
		const pdfBuffer = await this.operationPdfGenerationService.generatePdf(
			operation,
			authUser,
		);

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Kordis Einsatzprotokoll ${operation.sign}.pdf`,
		);
		res.end(pdfBuffer);
	}
}
