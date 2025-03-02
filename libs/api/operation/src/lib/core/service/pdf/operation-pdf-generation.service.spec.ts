import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import {
	GetOrganizationQuery,
	OrganizationViewModel,
} from '@kordis/api/organization';
import { GetUnitsByIdsQuery, UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import { OperationEntity } from '../../entity/operation.entity';
import {
	OperationAlertGroupInvolvement,
	OperationUnitInvolvement,
} from '../../entity/operation.value-objects';
import {
	OPERATION_TEMPLATE_RENDERER,
	OperationTemplateRenderer,
} from '../operation-template.renderer';
import { OperationPdfGenerationService } from './operation-pdf-generation.service';
import { PDF_GENERATION_SERVICE } from './pdf-generation.service';

const CURRENT_DATE = new Date('2025-01-31T17:16:39Z');

describe('OperationPdfGenerationService', () => {
	let service: OperationPdfGenerationService;
	let queryBus: DeepMocked<QueryBus>;
	let operationRenderer: DeepMocked<OperationTemplateRenderer>;

	beforeEach(async () => {
		jest.useFakeTimers().setSystemTime(CURRENT_DATE);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OperationPdfGenerationService,
				{
					provide: PDF_GENERATION_SERVICE,
					useValue: createMock(),
				},
				{
					provide: QueryBus,
					useValue: createMock(),
				},
				{
					provide: OPERATION_TEMPLATE_RENDERER,
					useValue: createMock(),
				},
			],
		}).compile();

		service = module.get<OperationPdfGenerationService>(
			OperationPdfGenerationService,
		);
		queryBus = module.get(QueryBus);
		operationRenderer = module.get(OPERATION_TEMPLATE_RENDERER);
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	it('should get buffer', async () => {
		const reqUser = {
			id: 'user-id',
			organizationId: 'org-id',
			firstName: 'John',
			lastName: 'Doe',
		} as AuthUser;
		const organization = {
			id: 'org-id',
			name: 'Test Organization',
		} as OrganizationViewModel;
		const operation = {
			id: 'operationId',
			start: new Date(),
			unitInvolvements: [] as OperationUnitInvolvement[],
			alertGroupInvolvements: [] as OperationAlertGroupInvolvement[],
		} as OperationEntity;

		queryBus.execute.mockImplementation((query) => {
			if (query instanceof GetOrganizationQuery) {
				return Promise.resolve(organization);
			} else if (query instanceof GetUnitsByIdsQuery) {
				return Promise.resolve([
					{ id: 'unit-id-1', name: 'Unit 1', callSign: 'U1' } as UnitViewModel,
					{ id: 'unit-id-2', name: 'Unit 2', callSign: 'U2' } as UnitViewModel,
				]);
			}
			return Promise.resolve([]);
		});

		await service.generatePdf(operation, reqUser);

		expect(operationRenderer.renderTemplate).toHaveBeenCalledWith({
			...operation,
			generatedAt: CURRENT_DATE,
			generatedBy: 'J. Doe',
			orgName: 'Test Organization',
		});
	});
});
