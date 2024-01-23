import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';

import { NewTetraStatusEvent } from '../event/new-tetra-status.event';
import {
	PublishTetraStatusCommand,
	PublishTetraStatusHandler,
} from './publish-tetra-status.command';

describe('PublishTetraStatusHandler', () => {
	let handler: PublishTetraStatusHandler;
	let eventBus: EventBus;

	beforeEach(() => {
		eventBus = createMock<EventBus>();
		handler = new PublishTetraStatusHandler(eventBus);
	});

	it('should publish NewRadioCallStatusReportEvent', async () => {
		const sendingIssi = '12345';
		const fmsStatus = 1;
		const sentAt = new Date();

		const command = new PublishTetraStatusCommand(
			sendingIssi,
			fmsStatus,
			sentAt,
		);
		const publishSpy = jest.spyOn(eventBus, 'publish');
		await handler.execute(command);

		expect(publishSpy).toHaveBeenCalledWith(
			new NewTetraStatusEvent(sendingIssi, fmsStatus, sentAt),
		);
	});
});
