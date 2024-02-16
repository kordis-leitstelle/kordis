import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import {
	HandleTetraControlWebhookCommand,
	HandleTetraControlWebhookHandler,
} from '../../core/command/handle-tetra-control-webhook.command';
import { UnhandledTetraControlWebhookTypeException } from '../../core/exception/unhandled-tetra-control-webhook-type.exception';
import { UnknownTetraControlWebhookKeyException } from '../../core/exception/unknown-tetra-control-webhook-key.exception';
import {
	TETRA_CONFIG_REPOSITORY,
	TetraConfigRepository,
} from '../../core/repository/tetra-config.repository';
import { TETRA_SERVICE, TetraService } from '../../core/service/tetra.service';
import { TetraControlWebhookController } from './tetra-control-webhook.controller';

describe('TetraControlWebhookController', () => {
	let controller: TetraControlWebhookController;
	let configService: ConfigService;
	let commandBus: CommandBus;

	beforeEach(async () => {
		configService = createMock<ConfigService>({
			getOrThrow: jest.fn().mockReturnValue('validKey'),
			get: jest.fn().mockReturnValue('192.168.0.1,192.168.0.2'),
		});
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			controllers: [TetraControlWebhookController],
			providers: [
				{ provide: ConfigService, useValue: configService },
				{ provide: TETRA_SERVICE, useValue: createMock<TetraService>() },
				{
					provide: TETRA_CONFIG_REPOSITORY,
					useValue: createMock<TetraConfigRepository>(),
				},
				HandleTetraControlWebhookHandler,
			],
		}).compile();
		await module.init();

		controller = module.get<TetraControlWebhookController>(
			TetraControlWebhookController,
		);
		commandBus = module.get<CommandBus>(CommandBus);
	});

	it('should throw UnauthorizedException key is invalid', async () => {
		const payload = { data: { type: 'status' } };
		const commendHandlerMock = jest.spyOn(commandBus, 'execute');

		commendHandlerMock.mockRejectedValueOnce(
			new UnknownTetraControlWebhookKeyException(),
		);
		await expect(
			controller.handleWebhook(payload as any, 'invalidKey', '192.168.1.0'),
		).rejects.toThrow(UnauthorizedException);
	});

	it('should throw BadRequestException when payload type has no handler', async () => {
		const payload = { data: { type: 'invalidType' } };
		const commendHandlerMock = jest.spyOn(commandBus, 'execute');

		commendHandlerMock.mockRejectedValueOnce(
			new UnhandledTetraControlWebhookTypeException(''),
		);
		await expect(
			controller.handleWebhook(payload as any, 'validKey', '192.168.0.1'),
		).rejects.toThrow(BadRequestException);
	});

	it('should emit HandleTetraControlWebhookCommand', async () => {
		const payload = { data: { type: 'status' } };
		const key = 'validKey';

		return new Promise<void>((done) => {
			commandBus.subscribe((command) => {
				expect(command).toBeInstanceOf(HandleTetraControlWebhookCommand);
				expect(command).toMatchObject({
					payload,
					key,
				});
				done();
			});
			controller.handleWebhook(payload as any, 'validKey', '192.168.0.1');
		});
	});
});
