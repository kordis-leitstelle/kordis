import { Test, TestingModule } from '@nestjs/testing';

import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';
import {
	ResetUnitNotesCommand,
	ResetUnitNotesHandler,
} from './reset-unit-notes.command';

describe('ResetUnitNotesHandler', () => {
	let handler: ResetUnitNotesHandler;
	let repository: UnitRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResetUnitNotesHandler,
				{
					provide: UNIT_REPOSITORY,
					useValue: {
						resetAllNotes: jest.fn(),
					},
				},
			],
		}).compile();

		handler = module.get<ResetUnitNotesHandler>(ResetUnitNotesHandler);
		repository = module.get<UnitRepository>(UNIT_REPOSITORY);
	});

	it('should reset all notes for the given organization ID', async () => {
		const command = new ResetUnitNotesCommand('orgId');
		await handler.execute(command);
		expect(repository.resetAllNotes).toHaveBeenCalledWith('orgId');
	});
});
