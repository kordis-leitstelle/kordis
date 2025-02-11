import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { RescueStationNoteUpdatedEvent } from '../../event/rescue-station-note-updated.event';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../../repository/rescue-station-deployment.repository';
import {
	UpdateRescueStationNoteCommand,
	UpdateRescueStationNoteHandler,
} from './update-rescue-station-note.command';

describe('UpdateRescueStationNoteHandler', () => {
	let handler: UpdateRescueStationNoteHandler;
	const mockRescueStationDeploymentRepository =
		createMock<RescueStationDeploymentRepository>();
	const mockEventBus = createMock<EventBus>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UpdateRescueStationNoteHandler,
				{
					provide: RESCUE_STATION_DEPLOYMENT_REPOSITORY,
					useValue: mockRescueStationDeploymentRepository,
				},
				{
					provide: EventBus,
					useValue: mockEventBus,
				},
			],
		}).compile();

		handler = module.get<UpdateRescueStationNoteHandler>(
			UpdateRescueStationNoteHandler,
		);
	});

	it('should update the note and publish an event', async () => {
		const orgId = 'orgId';
		const rescueStationId = 'rescueStationId';
		const note = 'new note';

		const command = new UpdateRescueStationNoteCommand(
			orgId,
			rescueStationId,
			note,
		);
		await handler.execute(command);

		expect(
			mockRescueStationDeploymentRepository.updateOne,
		).toHaveBeenCalledWith(orgId, rescueStationId, { note });
		expect(mockEventBus.publish).toHaveBeenCalledWith(
			new RescueStationNoteUpdatedEvent(orgId, rescueStationId),
		);
	});
});
