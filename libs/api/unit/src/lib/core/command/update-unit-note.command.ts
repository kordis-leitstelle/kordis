import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';

export class UpdateUnitNoteCommand {
	constructor(
		readonly orgId: string,
		readonly unitId: string,
		readonly note: string,
	) {}
}

@CommandHandler(UpdateUnitNoteCommand)
export class UpdateUnitNoteHandler
	implements ICommandHandler<UpdateUnitNoteCommand, boolean>
{
	constructor(
		@Inject(UNIT_REPOSITORY)
		private readonly repository: UnitRepository,
	) {}

	async execute({
		unitId,
		note,
		orgId,
	}: UpdateUnitNoteCommand): Promise<boolean> {
		return this.repository.updateNote(orgId, unitId, note);
	}
}
