import { Test } from '@nestjs/testing';

import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';
import {
	UpdateUnitNoteCommand,
	UpdateUnitNoteHandler,
} from './update-unit-note.command';

describe('UpdateUnitNoteHandler', () => {
	let handler: UpdateUnitNoteHandler;
	let repository: UnitRepository;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				UpdateUnitNoteHandler,
				{
					provide: UNIT_REPOSITORY,
					useValue: {
						updateNote: jest.fn().mockResolvedValue(true),
					},
				},
			],
		}).compile();

		handler = moduleRef.get<UpdateUnitNoteHandler>(UpdateUnitNoteHandler);
		repository = moduleRef.get<UnitRepository>(UNIT_REPOSITORY);
	});

	it('should call repository.updateNote() when handler.execute() is called', async () => {
		const command = new UpdateUnitNoteCommand('orgId', 'unitId', 'note');
		await handler.execute(command);

		expect(repository.updateNote).toHaveBeenCalledWith(
			'orgId',
			'unitId',
			'note',
		);
	});
});
