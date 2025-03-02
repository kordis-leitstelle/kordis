import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import DataLoader from 'dataloader';

import { DataLoaderContextProvider } from '@kordis/api/shared';
import { AlertGroupViewModel, UnitViewModel } from '@kordis/api/unit';

import {
	OperationAlertGroupInvolvement,
	OperationUnitInvolvement,
} from '../../core/entity/operation.value-objects';
import {
	OperationAlertGroupInvolvementResolver,
	OperationUnitInvolvementResolver,
} from './operation-reference.resolver';

describe('OperationUnitInvolvementResolver', () => {
	let resolver: OperationUnitInvolvementResolver;
	const mockLoadersProvider = createMock<DataLoaderContextProvider>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [OperationUnitInvolvementResolver],
		}).compile();

		resolver = module.get<OperationUnitInvolvementResolver>(
			OperationUnitInvolvementResolver,
		);
	});

	it('should load unit by id', async () => {
		const unitId = 'unitId';
		const mockUnitViewModel = new UnitViewModel();
		(mockUnitViewModel as any).id = unitId;
		const mockDataLoader = createMock<DataLoader<string, UnitViewModel>>();
		mockDataLoader.load.mockResolvedValueOnce(mockUnitViewModel);
		mockLoadersProvider.getLoader.mockReturnValueOnce(mockDataLoader);

		const operationUnitInvolvement = new OperationUnitInvolvement();
		operationUnitInvolvement.unit = { id: unitId };

		const result = await resolver.unit(operationUnitInvolvement, {
			loadersProvider: mockLoadersProvider,
		});

		expect(mockDataLoader.load).toHaveBeenCalledWith(unitId);
		expect(result).toEqual(mockUnitViewModel);
	});
});

describe('OperationAlertGroupInvolvementResolver', () => {
	let resolver: OperationAlertGroupInvolvementResolver;
	const mockLoadersProvider = createMock<DataLoaderContextProvider>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [OperationAlertGroupInvolvementResolver],
		}).compile();

		resolver = module.get<OperationAlertGroupInvolvementResolver>(
			OperationAlertGroupInvolvementResolver,
		);
	});

	it('should load alertGroup by id', async () => {
		const alertGroupId = 'alertGroupId';
		const mockAlertGroupViewModel = new AlertGroupViewModel();
		(mockAlertGroupViewModel as any).id = alertGroupId;
		const mockDataLoader =
			createMock<DataLoader<string, AlertGroupViewModel>>();
		mockDataLoader.load.mockResolvedValueOnce(mockAlertGroupViewModel);
		mockLoadersProvider.getLoader.mockReturnValueOnce(mockDataLoader);

		const operationAlertGroupInvolvement = new OperationAlertGroupInvolvement();
		operationAlertGroupInvolvement.alertGroup = { id: alertGroupId };

		const result = await resolver.alertGroup(operationAlertGroupInvolvement, {
			loadersProvider: mockLoadersProvider,
		});

		expect(mockDataLoader.load).toHaveBeenCalledWith(alertGroupId);
		expect(result).toEqual(mockAlertGroupViewModel);
	});
});
