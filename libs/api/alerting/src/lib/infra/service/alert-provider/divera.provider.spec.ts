import { createMock } from '@golevelup/ts-jest';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AlarmBuilder, DiveraClient } from 'divera247-api-unofficial';

import { OperationViewModel } from '@kordis/api/operation';

import { AlertGroupDiveraConfig } from '../../../core/entity/alert-group-config.entity';
import { DiveraOrgConfig } from '../../../core/entity/alert-org-config.entity';
import { DiveraRequestFailedError } from '../../error/divera-request-failed.error';
import { DiveraProvider } from './divera.provider';

jest.mock('divera247-api-unofficial');

describe('DiveraProvider', () => {
	let diveraProvider: DiveraProvider;
	let mockClient: jest.Mocked<DiveraClient>;

	beforeEach(() => {
		mockClient = createMock<DiveraClient>();
		(DiveraClient as unknown) = jest.fn(() => mockClient);
		(AlarmBuilder as unknown) = jest.requireActual(
			'divera247-api-unofficial',
		).AlarmBuilder;
		diveraProvider = new DiveraProvider();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('alertWithOperation', () => {
		it('should send an alarm successfully', async () => {
			const alertGroupConfigs: AlertGroupDiveraConfig[] = [
				{
					diveraGroupId: '123', // Changed to string
					alertGroupId: 'test-group',
				} as AlertGroupDiveraConfig,
			];
			const operation: OperationViewModel = {
				location: { address: { name: 'Test', street: 'Street', city: 'City' } },
				alarmKeyword: 'Test Alarm',
				description: 'Test Description',
				sign: '123',
			} as OperationViewModel;
			const config: DiveraOrgConfig = {
				token: 'test-token',
			} as DiveraOrgConfig;

			mockClient.createAlarm.mockResolvedValue({
				success: true,
				data: {} as any, // Mocked Alarm data
			});

			await expect(
				diveraProvider.alertWithOperation(
					alertGroupConfigs,
					operation,
					false,
					config,
				),
			).resolves.not.toThrow();

			expect(mockClient.createAlarm).toHaveBeenCalledWith({
				Alarm: {
					address: 'Test Street, City',
					foreign_id: 'KORDIS-123',
					group: ['123'],
					send_mail: true,
					send_push: true,
					text: 'Test Description',
					title: 'Test Alarm',
				},
				instructions: {
					group: {
						mapping: 'id',
					},
				},
			});
		});

		it('should throw DiveraRequestFailedError if the request fails', async () => {
			const alertGroupConfigs: AlertGroupDiveraConfig[] = [
				{
					diveraGroupId: '123', // Changed to string
					alertGroupId: 'test-group',
				} as AlertGroupDiveraConfig,
			];
			const operation: OperationViewModel = {
				location: { address: { name: 'Test', street: 'Street', city: 'City' } },
				alarmKeyword: 'Test Alarm',
				description: 'Test Description',
				sign: '123',
			} as OperationViewModel;
			const config: DiveraOrgConfig = {
				token: 'test-token',
			} as DiveraOrgConfig;

			mockClient.createAlarm.mockResolvedValue({
				success: false,
				error: 'Request failed',
			});

			await expect(
				diveraProvider.alertWithOperation(
					alertGroupConfigs,
					operation,
					false,
					config,
				),
			).rejects.toThrow(DiveraRequestFailedError);
		});
	});
});
