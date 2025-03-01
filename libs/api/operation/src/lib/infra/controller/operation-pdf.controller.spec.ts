import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { Response } from 'express';

import { AuthUser } from '@kordis/shared/model';

import { OperationEntity } from '../../core/entity/operation.entity';
import { GetOperationByIdQuery } from '../../core/query/get-operation-by-id.query';
import { OperationPdfGenerationService } from '../../core/service/pdf/operation-pdf-generation.service';
import { OperationPdfController } from './operation-pdf.controller';

describe('OperationPdfController', () => {
	let controller: OperationPdfController;
	let mockQueryBus: DeepMocked<QueryBus>;
	let mockOperationPdfGenerationService: DeepMocked<OperationPdfGenerationService>;
	let res: Response;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [OperationPdfController],
			providers: [
				{ provide: QueryBus, useValue: createMock<QueryBus>() },
				{
					provide: OperationPdfGenerationService,
					useValue: createMock<OperationPdfGenerationService>(),
				},
			],
		}).compile();

		controller = moduleRef.get<OperationPdfController>(OperationPdfController);
		mockQueryBus = moduleRef.get<DeepMocked<QueryBus>>(QueryBus);
		mockOperationPdfGenerationService = moduleRef.get<
			DeepMocked<OperationPdfGenerationService>
		>(OperationPdfGenerationService);

		res = createMock<Response>();
	});

	it('should generate a PDF and return correct headers and buffer', async () => {
		const operation = new OperationEntity();
		operation.sign = 'sign1';

		const mockBuffer = Buffer.from('mock pdf data');

		mockQueryBus.execute.mockResolvedValue(operation);
		mockOperationPdfGenerationService.generatePdf.mockResolvedValue(mockBuffer);

		const authUser = { organizationId: 'org1' } as AuthUser;
		const operationId = 'op1';

		await controller.getPdf(authUser, operationId, res);

		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetOperationByIdQuery(authUser.organizationId, operationId),
		);
		expect(mockOperationPdfGenerationService.generatePdf).toHaveBeenCalledWith(
			operation,
			authUser,
		);

		expect(res.setHeader).toHaveBeenCalledWith(
			'Content-Type',
			'application/pdf',
		);
		expect(res.setHeader).toHaveBeenCalledWith(
			'Content-Disposition',
			`inline; filename=Kordis Einsatzprotokoll ${operation.sign}.pdf`,
		);
		expect(res.end).toHaveBeenCalledWith(mockBuffer);
	});
});
