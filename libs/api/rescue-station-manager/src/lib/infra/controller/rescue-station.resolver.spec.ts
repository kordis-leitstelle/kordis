import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { DeploymentNotFoundException } from '@kordis/api/deployment';
import {
	BaseCreateMessageArgs,
	ProtocolMessageArgs,
	UnitInput,
} from '@kordis/api/protocol';
import { PresentableNotFoundException } from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { LaunchSignOffProcessCommand } from '../../core/command/launch-sign-off-process.command';
import { LaunchSignOnProcessCommand } from '../../core/command/launch-sign-on-process.command';
import { LaunchUpdateSignedInRescueStationProcessCommand } from '../../core/command/launch-update-signed-in-rescue-station-process.command';
import { RescueStationResolver } from './rescue-station.resolver';

const PROTOCOL_ARGS_DATA: ProtocolMessageArgs = {
	protocolMessage: plainToInstance(BaseCreateMessageArgs, {
		sender: plainToInstance(UnitInput, {
			type: 'REGISTERED_UNIT',
			id: 'senderId',
		}),
		recipient: plainToInstance(UnitInput, {
			type: 'UNKNOWN_UNIT',
			name: 'recipientName',
		}),
		channel: 'channel',
	}),
};

const RS_ARGS_DATA = {
	rescueStationId: 'rescueStationId',
	assignedAlertGroups: [],
	assignedUnitIds: [],
	note: 'note',
	strength: {
		leaders: 1,
		subLeaders: 1,
		helpers: 1,
	},
};

const EXPECTED_PROTOCOL_DATA = {
	sender: {
		unit: { id: 'senderId' },
	},
	recipient: {
		name: 'recipientName',
	},
	channel: 'channel',
};

const AUTH_USER = { organizationId: 'orgId' } as AuthUser;

describe('RescueStationResolver', () => {
	let resolver: RescueStationResolver;
	let commandBus: DeepMocked<CommandBus>;
	let queryBus: DeepMocked<QueryBus>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [RescueStationResolver],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.overrideProvider(QueryBus)
			.useValue(createMock<QueryBus>())
			.compile();

		resolver = module.get<RescueStationResolver>(RescueStationResolver);
		commandBus = module.get<DeepMocked<CommandBus>>(CommandBus);
		queryBus = module.get<DeepMocked<QueryBus>>(QueryBus);
	});

	describe('updateSignedInRescueStation', () => {
		it('should update signed in rescue station', async () => {
			await resolver.updateSignedInRescueStation(
				AUTH_USER,
				RS_ARGS_DATA,
				PROTOCOL_ARGS_DATA,
			);

			expect(commandBus.execute).toHaveBeenCalledWith(
				new LaunchUpdateSignedInRescueStationProcessCommand(
					AUTH_USER,
					RS_ARGS_DATA,
					EXPECTED_PROTOCOL_DATA,
				),
			);
		});

		it('should return deployment', async () => {
			const expectedResult = {
				id: 'rescueStationId',
			};

			queryBus.execute.mockResolvedValue(expectedResult);

			const result = await resolver.updateSignedInRescueStation(
				{ organizationId: 'orgId' } as AuthUser,
				RS_ARGS_DATA,
				PROTOCOL_ARGS_DATA,
			);

			expect(result).toEqual(expectedResult);
			expect(commandBus.execute).toHaveBeenCalledWith(
				new LaunchUpdateSignedInRescueStationProcessCommand(
					AUTH_USER,
					RS_ARGS_DATA,
					EXPECTED_PROTOCOL_DATA,
				),
			);
		});

		it('should throw presentable not found exception', async () => {
			commandBus.execute.mockRejectedValue(new DeploymentNotFoundException());

			await expect(
				resolver.updateSignedInRescueStation(
					AUTH_USER,
					RS_ARGS_DATA,
					PROTOCOL_ARGS_DATA,
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});

	describe('signOffRescueStation', () => {
		it('should sign off rescue station', async () => {
			const rescueStationId = 'rescueStationId';
			await resolver.signOffRescueStation(
				AUTH_USER,
				rescueStationId,
				PROTOCOL_ARGS_DATA,
			);

			expect(commandBus.execute).toHaveBeenCalledWith(
				new LaunchSignOffProcessCommand(
					AUTH_USER,
					rescueStationId,
					EXPECTED_PROTOCOL_DATA,
				),
			);
		});

		it('should return deployment', async () => {
			const expectedResult = { id: 'rescueStationId' };

			queryBus.execute.mockResolvedValue(expectedResult);

			const result = await resolver.signOffRescueStation(
				AUTH_USER,
				'rescueStationId',
				PROTOCOL_ARGS_DATA,
			);

			expect(result).toEqual(expectedResult);
			expect(commandBus.execute).toHaveBeenCalledWith(
				new LaunchSignOffProcessCommand(
					AUTH_USER,
					'rescueStationId',
					EXPECTED_PROTOCOL_DATA,
				),
			);
		});

		it('should throw presentable not found exception', async () => {
			commandBus.execute.mockRejectedValue(new DeploymentNotFoundException());

			await expect(
				resolver.signOffRescueStation(
					AUTH_USER,
					'rescueStationId',
					PROTOCOL_ARGS_DATA,
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});

	describe('signInRescueStation', () => {
		it('should sign in rescue station', async () => {
			await resolver.signInRescueStation(
				AUTH_USER,
				RS_ARGS_DATA,
				PROTOCOL_ARGS_DATA,
			);

			expect(commandBus.execute).toHaveBeenCalledWith(
				new LaunchSignOnProcessCommand(
					AUTH_USER,
					RS_ARGS_DATA,
					EXPECTED_PROTOCOL_DATA,
				),
			);
		});

		it('should return deployment', async () => {
			const expectedResult = {
				id: 'rescueStationId',
			};

			queryBus.execute.mockResolvedValue(expectedResult);

			const result = await resolver.signInRescueStation(
				AUTH_USER,
				RS_ARGS_DATA,
				PROTOCOL_ARGS_DATA,
			);

			expect(result).toEqual(expectedResult);
			expect(commandBus.execute).toHaveBeenCalledWith(
				new LaunchSignOnProcessCommand(
					AUTH_USER,
					RS_ARGS_DATA,
					EXPECTED_PROTOCOL_DATA,
				),
			);
		});

		it('should throw a presentable when an error occurs', async () => {
			commandBus.execute.mockRejectedValue(new DeploymentNotFoundException());

			await expect(
				resolver.signInRescueStation(
					AUTH_USER,
					RS_ARGS_DATA,
					PROTOCOL_ARGS_DATA,
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});
});
