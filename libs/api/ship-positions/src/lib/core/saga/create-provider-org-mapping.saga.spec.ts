import { createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus, ICommand } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { first } from 'rxjs';

import { OrganizationCreatedEvent } from '@kordis/api/organization';

import {
	UpsertOrgShipPositionsProvideHandler,
	UpsertOrgShipPositionsProviderCommand,
} from '../command/upsert-org-ship-positions-provider.command';
import {
	ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY,
	OrgShipPositionsProviderRepository,
} from '../repository/org-ship-positions-provider.repository';
import { CreateProviderOrgMappingSaga } from './create-provider-org-mapping.saga';

describe('CreateProviderOrgMappingSaga', () => {
	let eventBus: EventBus;
	let commandBus: CommandBus;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [
				CreateProviderOrgMappingSaga,
				UpsertOrgShipPositionsProvideHandler,
				{
					provide: ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY,
					useValue: createMock<OrgShipPositionsProviderRepository>(),
				},
			],
		}).compile();

		eventBus = moduleRef.get<EventBus>(EventBus);
		commandBus = moduleRef.get<CommandBus>(CommandBus);
		await moduleRef.init();
	});

	it('should emit UpsertOrgShipPositionsProviderCommand on OrganizationCreatedEvent', () => {
		return new Promise<void>((done) => {
			const orgId = 'org-123';

			commandBus.pipe(first()).subscribe((command: ICommand) => {
				expect(command).toBeInstanceOf(UpsertOrgShipPositionsProviderCommand);
				expect(command).toEqual(
					new UpsertOrgShipPositionsProviderCommand(orgId, 'none'),
				);
				done();
			});

			const orgCreatedEvent = new OrganizationCreatedEvent({
				id: orgId,
			} as any);
			eventBus.publish(orgCreatedEvent);
		});
	}, 1000);
});
