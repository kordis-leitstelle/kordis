import { createMock } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { of } from 'rxjs';

import { PublishTetraStatusCommand } from '../../core/command/publish-tetra-status.command';
import {
	TetraControlService,
	TetraControlStatusPayload,
} from './tetra-control.service';

describe('TetraControlService', () => {
	let service: TetraControlService;
	let httpServiceMock: HttpService;
	let commandBusMock: CommandBus;
	let configServiceMock: ConfigService;

	beforeEach(() => {
		httpServiceMock = createMock<HttpService>({
			get: jest.fn().mockReturnValue(of({})),
		});
		commandBusMock = createMock<CommandBus>();
		configServiceMock = createMock<ConfigService>({
			getOrThrow: jest
				.fn()
				.mockReturnValueOnce('https://tetra-control-service.com')
				.mockReturnValueOnce('mock_key'),
		});

		service = new TetraControlService(
			httpServiceMock,
			commandBusMock,
			configServiceMock,
		);
	});

	it('should send a call out with the provided parameters', async () => {
		const issi = '12345';
		const message = 'Test message';
		const noReply = false;
		const prio = 5;

		await service.sendCallOut(issi, message, noReply, prio);

		expect(httpServiceMock.get).toHaveBeenCalledWith(
			'https://tetra-control-service.com/API/SDS?Ziel=12345&Typ=195&Text=Test%20message&noreply=0&userkey=mock_key&COPrio=5',
		);
	});

	it('should send an SDS with the provided parameters', async () => {
		const issi = '12345';
		const message = 'Test message';
		const isFlash = true;

		await service.sendSDS(issi, message, isFlash);
		expect(httpServiceMock.get).toHaveBeenCalledWith(
			'https://tetra-control-service.com/API/SDS?Ziel=12345&Text=Test%20message&Flash=1&userkey=mock_key',
		);
	});

	it('should send a status with the provided parameters', async () => {
		const issi = '12345';
		const status = 3;

		await service.sendStatus(issi, status);

		expect(httpServiceMock.get).toHaveBeenCalledWith(
			'https://tetra-control-service.com/API/ISSIUPD?issi=12345&status=8005&userkey=mock_key',
		);
	});

	it('should execute SaveTetraStatusCommand with the provided payload', async () => {
		const payload: TetraControlStatusPayload = {
			message: 'Test message',
			sender: 'sender',
			type: 'type',
			timestamp: '/Date(1624800000000)/',
			data: {
				type: 'status',
				status: '1',
				statusCode: 'statusCode',
				statusText: 'statusText',
				destSSI: 'destSSI',
				destName: 'destName',
				srcSSI: 'srcSSI',
				srcName: 'srcName',
				ts: 'ts',
				radioID: 1,
				radioName: 'radioName',
				remark: 'remark',
			},
		};

		commandBusMock.execute = jest.fn().mockResolvedValueOnce(undefined);

		await service.handleStatusWebhook(payload);

		const expectedCommand = new PublishTetraStatusCommand(
			payload.sender,
			1,
			new Date(1624800000000),
		);
		expect(commandBusMock.execute).toHaveBeenCalledWith(expectedCommand);
	});

	it('should not execute SaveTetraStatusCommand if payload type is not of interest', async () => {
		const payload = {
			message: 'Test message',
			sender: 'sender',
			type: 'type',
			timestamp: '/Date(1624800000000)/',
			data: {
				type: 'falsy-tyoe',
				status: '',
				statusCode: 'statusCode',
				statusText: 'statusText',
				destSSI: 'destSSI',
				destName: 'destName',
				srcSSI: 'srcSSI',
				srcName: 'srcName',
				ts: 'ts',
				radioID: 1,
				radioName: 'radioName',
				remark: 'remark',
			},
		};

		commandBusMock.execute = jest.fn().mockResolvedValueOnce(undefined);
		await service.handleStatusWebhook(payload as TetraControlStatusPayload);
		expect(commandBusMock.execute).not.toHaveBeenCalled();
	});
});
