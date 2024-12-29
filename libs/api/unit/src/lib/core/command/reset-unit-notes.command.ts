import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';

export class ResetUnitNotesCommand {
	constructor(readonly orgId: string) {}
}

@CommandHandler(ResetUnitNotesCommand)
export class ResetUnitNotesHandler
	implements ICommandHandler<ResetUnitNotesCommand, boolean>
{
	constructor(
		@Inject(UNIT_REPOSITORY)
		private readonly repository: UnitRepository,
	) {}

	async execute({ orgId }: ResetUnitNotesCommand): Promise<boolean> {
		return this.repository.resetAllNotes(orgId);
	}
}
