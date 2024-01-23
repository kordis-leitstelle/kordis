import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { TETRA_SERVICE } from '../../core/service/tetra.service';
import { TetraControlService } from '../service/tetra-control.service';
import { TetraControlWebhookController } from './tetra-control-webhook.controller';

describe('TetraControlWebhookController', () => {
	let controller: TetraControlWebhookController;
	let configService: ConfigService;
	let tetraService: TetraControlService;

	beforeEach(async () => {
		configService = createMock<ConfigService>({
			getOrThrow: jest.fn().mockReturnValue('validKey'),
			get: jest.fn().mockReturnValue('192.168.0.1,192.168.0.2'),
		});
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TetraControlWebhookController],
			providers: [
				{ provide: TETRA_SERVICE, useValue: createMock<CommandBus>() },
				{ provide: ConfigService, useValue: configService },
			],
		}).compile();

		controller = module.get<TetraControlWebhookController>(
			TetraControlWebhookController,
		);
		tetraService = module.get<TetraControlService>(TETRA_SERVICE);
	});

	it('should throw UnauthorizedException when IP or key is invalid', async () => {
		const payload = { data: { type: 'status' } };

		await expect(
			controller.handleWebhook(payload as any, 'invalidKey', '192.168.1.0'),
		).rejects.toThrow(UnauthorizedException);
	});

	it('should throw BadRequestException when payload type has no handler', async () => {
		const payload = { data: { type: 'invalidType' } };

		await expect(
			controller.handleWebhook(payload as any, 'validKey', '192.168.0.1'),
		).rejects.toThrow(BadRequestException);
	});

	it('should execute command when payload type has a handler', async () => {
		const payload = { data: { type: 'status' } };

		await controller.handleWebhook(payload as any, 'validKey', '192.168.0.2');

		expect(tetraService.handleStatusWebhook).toHaveBeenCalledWith(payload);
	});
});
