import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';

import {
	TETRA_CONFIG_REPOSITORY,
	TetraConfigRepository,
} from '../../core/repository/tetra-config.repository';
import { TetraControlService } from './tetra-control.service';

describe('TetraControlService', () => {
	let service: TetraControlService;
	let httpServiceMock: DeepMocked<HttpService>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				TetraControlService,
				{
					provide: TETRA_CONFIG_REPOSITORY,
					useValue: createMock<TetraConfigRepository>({
						findByOrgId: () =>
							Promise.resolve({
								orgId: 'orgId',
								webhookAccessKey: 'accessKey',
								tetraControlApiUrl: 'https://tetra-control-service.com',
								tetraControlApiUserKey: 'mock_key',
							}),
						findByWebhookAccessKey: () =>
							Promise.resolve({
								orgId: 'orgId',
								webhookAccessKey: 'accessKey',
								tetraControlApiUrl: 'https://tetra-control-service.com',
								tetraControlApiUserKey: 'mock_key',
							}),
					}),
				},
				{
					provide: HttpService,
					useValue: createMock<HttpService>({
						get: jest.fn().mockReturnValue(of({})),
					}),
				},
			],
		}).compile();

		service = moduleRef.get(TetraControlService);
		httpServiceMock = moduleRef.get(HttpService);
	});

	it('should send a call out with the provided parameters', async () => {
		const issi = '12345';
		const message = 'Test message';
		const noReply = false;
		const prio = 5;

		await service.sendCallOut('orgId', issi, message, noReply, prio);

		expect(httpServiceMock.get).toHaveBeenCalledWith(
			'https://tetra-control-service.com/API/SDS?Ziel=12345&Typ=195&Text=Test%20message&noreply=0&userkey=mock_key&COPrio=5',
		);
	});

	it('should send an SDS with the provided parameters', async () => {
		const issi = '12345';
		const message = 'Test message';
		const isFlash = true;

		await service.sendSDS('orgId', issi, message, isFlash);
		expect(httpServiceMock.get).toHaveBeenCalledWith(
			'https://tetra-control-service.com/API/SDS?Ziel=12345&Text=Test%20message&Flash=1&userkey=mock_key',
		);
	});

	it('should send a status with the provided parameters', async () => {
		const issi = '12345';
		const status = 3;

		await service.sendStatus('orgId', issi, status);

		expect(httpServiceMock.get).toHaveBeenCalledWith(
			'https://tetra-control-service.com/API/ISSIUPD?issi=12345&status=8005&userkey=mock_key',
		);
	});
});
