import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { TetraConfig } from '../entity/tetra-config.entitiy';
import { NewTetraStatusEvent } from '../event/new-tetra-status.event';
import { UnknownTetraControlWebhookKeyException } from '../exception/unknown-tetra-control-webhook-key.exception';
import { TetraControlStatusPayload } from '../model/tetra-control-status-payload.model';
import {
	TETRA_CONFIG_REPOSITORY,
	TetraConfigRepository,
} from '../repository/tetra-config.repository';
import { TETRA_SERVICE, TetraService } from '../service/tetra.service';
import { HandleTetraControlWebhookHandler } from './handle-tetra-control-webhook.command';

describe('HandleTetraControlWebhookHandler', () => {
	let handler: HandleTetraControlWebhookHandler;
	let tetraConfigRepository: DeepMocked<TetraConfigRepository>;
	let eventBus: DeepMocked<EventBus>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				HandleTetraControlWebhookHandler,
				{ provide: TETRA_SERVICE, useValue: createMock<TetraService>() },
				{
					provide: TETRA_CONFIG_REPOSITORY,
					useValue: createMock<TetraConfigRepository>(),
				},
				{ provide: EventBus, useValue: createMock<EventBus>() },
			],
		}).compile();

		handler = moduleRef.get<HandleTetraControlWebhookHandler>(
			HandleTetraControlWebhookHandler,
		);
		tetraConfigRepository = moduleRef.get<DeepMocked<TetraConfigRepository>>(
			TETRA_CONFIG_REPOSITORY,
		);
		eventBus = moduleRef.get<DeepMocked<EventBus>>(EventBus);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should throw UnknownTetraControlWebhookKeyException when key not found', async () => {
		tetraConfigRepository.findByWebhookAccessKey.mockResolvedValueOnce(null);

		await expect(
			handler.execute({
				payload: { data: { type: 'status' } } as TetraControlStatusPayload,
				key: 'test',
			}),
		).rejects.toThrow(UnknownTetraControlWebhookKeyException);
	});

	it('should dispatch new status', async () => {
		tetraConfigRepository.findByWebhookAccessKey.mockResolvedValueOnce({
			orgId: 'orgId',
		} as TetraConfig);
		const date = new Date('1998-09-16');
		await handler.execute({
			payload: {
				data: { type: 'status', status: '1' },
				sender: 'sender',
				timestamp: `/Date(${date.getTime()})/`,
			} as TetraControlStatusPayload,
			key: 'test',
		});

		expect(eventBus.publish).toHaveBeenCalledWith(
			new NewTetraStatusEvent('orgId', 'sender', 1, date, 'TetraControl'),
		);
	});

	it('should not dispatch new status when no', async () => {
		tetraConfigRepository.findByWebhookAccessKey.mockResolvedValueOnce({
			orgId: 'orgId',
		} as TetraConfig);
		const date = new Date('1998-09-16');
		await handler.execute({
			payload: {
				data: { type: 'status', status: '1' },
				sender: 'sender',
				timestamp: `/Date(${date.getTime()})/`,
			} as TetraControlStatusPayload,
			key: 'test',
		});

		expect(eventBus.publish).toHaveBeenCalledWith(
			new NewTetraStatusEvent('orgId', 'sender', 1, date, 'TetraControl'),
		);
	});
});
