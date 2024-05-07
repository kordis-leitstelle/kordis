import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { DeploymentNotFoundException } from '@kordis/api/deployment';
import { PresentableNotFoundException } from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { StartSignInProcessCommand } from '../../core/command/start-sign-in-process.command';
import { StartSignOffProcessCommand } from '../../core/command/start-sign-off-process.command';
import { StartUpdateSignedInRescueStationProcessCommand } from '../../core/command/update-signed-in-rescue-station.command';
import { RescueStationResolver } from './rescue-station.resolver';

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
		const args = {
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
		it('should update signed in rescue station', async () => {
			await resolver.updateSignedInRescueStation(
				{ organizationId: 'orgId' } as AuthUser,
				args,
			);

			expect(commandBus.execute).toHaveBeenCalledWith(
				new StartUpdateSignedInRescueStationProcessCommand('orgId', args),
			);
		});

		it('should return deployment', async () => {
			const expectedResult = {
				id: 'rescueStationId',
			};

			queryBus.execute.mockResolvedValue(expectedResult);

			const result = await resolver.updateSignedInRescueStation(
				{ organizationId: 'orgId' } as AuthUser,
				args,
			);

			expect(result).toEqual(expectedResult);
			expect(commandBus.execute).toHaveBeenCalledWith(
				new StartUpdateSignedInRescueStationProcessCommand('orgId', args),
			);
		});

		it('should throw presentable not found exception', async () => {
			commandBus.execute.mockRejectedValue(new DeploymentNotFoundException());

			await expect(
				resolver.updateSignedInRescueStation(
					{ organizationId: 'orgId' } as AuthUser,
					args,
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});

	describe('signOffRescueStation', () => {
		it('should sign off rescue station', async () => {
			const rescueStationId = 'rescueStationId';
			await resolver.signOffRescueStation(
				{ organizationId: 'orgId' } as AuthUser,
				rescueStationId,
			);

			expect(commandBus.execute).toHaveBeenCalledWith(
				new StartSignOffProcessCommand('orgId', rescueStationId),
			);
		});

		it('should return deployment', async () => {
			const expectedResult = { id: 'rescueStationId' };

			queryBus.execute.mockResolvedValue(expectedResult);

			const result = await resolver.signOffRescueStation(
				{ organizationId: 'orgId' } as AuthUser,
				'rescueStationId',
			);

			expect(result).toEqual(expectedResult);
			expect(commandBus.execute).toHaveBeenCalledWith(
				new StartSignOffProcessCommand('orgId', 'rescueStationId'),
			);
		});

		it('should throw presentable not found exception', async () => {
			commandBus.execute.mockRejectedValue(new DeploymentNotFoundException());

			await expect(
				resolver.signOffRescueStation(
					{ organizationId: 'orgId' } as AuthUser,
					'rescueStationId',
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});

	describe('signInRescueStation', () => {
		const args = {
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

		it('should sign in rescue station', async () => {
			await resolver.signInRescueStation(
				{ organizationId: 'orgId' } as AuthUser,
				args,
			);

			expect(commandBus.execute).toHaveBeenCalledWith(
				new StartSignInProcessCommand('orgId', args),
			);
		});

		it('should return deployment', async () => {
			const expectedResult = {
				id: 'rescueStationId',
			};

			queryBus.execute.mockResolvedValue(expectedResult);

			const result = await resolver.signInRescueStation(
				{ organizationId: 'orgId' } as AuthUser,
				args,
			);

			expect(result).toEqual(expectedResult);
			expect(commandBus.execute).toHaveBeenCalledWith(
				new StartSignInProcessCommand('orgId', args),
			);
		});

		it('should throw a presentable when an error occurs', async () => {
			commandBus.execute.mockRejectedValue(new DeploymentNotFoundException());

			await expect(
				resolver.signInRescueStation(
					{ organizationId: 'orgId' } as AuthUser,
					args,
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});
});
