import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import {
	DeploymentNotFoundException,
	GetRescueStationDeploymentQuery,
	RescueStationDeploymentViewModel,
} from '@kordis/api/deployment';
import { PresentableNotFoundException } from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { StartSignInProcessCommand } from '../../core/command/start-sign-in-process.command';
import { StartSignOffProcessCommand } from '../../core/command/start-sign-off-process.command';
import { StartUpdateSignedInRescueStationProcessCommand } from '../../core/command/update-signed-in-rescue-station.command';
import { UpdateRescueStationArgs } from '../argument/update-rescue-station.argument';

@Resolver()
export class RescueStationResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	@Mutation(() => RescueStationDeploymentViewModel)
	async updateSignedInRescueStation(
		@RequestUser() { organizationId }: AuthUser,
		@Args() args: UpdateRescueStationArgs,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			await this.commandBus.execute(
				new StartUpdateSignedInRescueStationProcessCommand(
					organizationId,
					args,
				),
			);
			return this.queryBus.execute(
				new GetRescueStationDeploymentQuery(
					organizationId,
					args.rescueStationId,
				),
			);
		} catch (e) {
			this.throwPresentable(e);
			throw e;
		}
	}

	@Mutation(() => RescueStationDeploymentViewModel)
	async signOffRescueStation(
		@RequestUser() { organizationId }: AuthUser,
		@Args('rescueStationId') rescueStationId: string,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			await this.commandBus.execute(
				new StartSignOffProcessCommand(organizationId, rescueStationId),
			);
			return this.queryBus.execute(
				new GetRescueStationDeploymentQuery(organizationId, rescueStationId),
			);
		} catch (e) {
			this.throwPresentable(e);
			throw e;
		}
	}

	@Mutation(() => RescueStationDeploymentViewModel)
	async signInRescueStation(
		@RequestUser() { organizationId }: AuthUser,
		@Args() args: UpdateRescueStationArgs,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			await this.commandBus.execute(
				new StartSignInProcessCommand(organizationId, args),
			);
			return this.queryBus.execute(
				new GetRescueStationDeploymentQuery(
					organizationId,
					args.rescueStationId,
				),
			);
		} catch (e) {
			this.throwPresentable(e);
			throw e;
		}
	}

	private throwPresentable(e: unknown): void {
		if (e instanceof DeploymentNotFoundException) {
			throw new PresentableNotFoundException(
				'Die Rettungswache konnte nicht gefunden werden.',
			);
		}
	}
}
