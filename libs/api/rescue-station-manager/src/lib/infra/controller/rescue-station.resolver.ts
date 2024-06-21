import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import {
	DeploymentNotFoundException,
	GetRescueStationDeploymentQuery,
	RescueStationDeploymentViewModel,
} from '@kordis/api/deployment';
import { BaseCreateMessageArgs } from '@kordis/api/protocol';
import { PresentableNotFoundException } from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { StartSignOffProcessCommand } from '../../core/command/start-sign-off-process.command';
import { StartSignOnProcessCommand } from '../../core/command/start-sign-on-process.command';
import { StartUpdateSignedInRescueStationProcessCommand } from '../../core/command/start-update-signed-in-rescue-station-process.command';
import { UpdateRescueStationInput } from '../argument/update-rescue-station.argument';

@Resolver()
export class RescueStationResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	@Mutation(() => RescueStationDeploymentViewModel)
	async updateSignedInRescueStation(
		@RequestUser() reqUser: AuthUser,
		@Args('rescueStationData') rescueStationData: UpdateRescueStationInput,
		@Args('protocolMessageData') protocolMessageData: BaseCreateMessageArgs,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			await this.commandBus.execute(
				new StartUpdateSignedInRescueStationProcessCommand(
					reqUser,
					rescueStationData,
					await protocolMessageData.asTransformedPayload(),
				),
			);
			return this.queryBus.execute(
				new GetRescueStationDeploymentQuery(
					reqUser.organizationId,
					rescueStationData.rescueStationId,
				),
			);
		} catch (e) {
			this.throwPresentable(e);
			throw e;
		}
	}

	@Mutation(() => RescueStationDeploymentViewModel)
	async signOffRescueStation(
		@RequestUser() reqUser: AuthUser,
		@Args('rescueStationId') rescueStationId: string,
		@Args('protocolMessageData') protocolMessageData: BaseCreateMessageArgs,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			await this.commandBus.execute(
				new StartSignOffProcessCommand(
					reqUser,
					rescueStationId,
					await protocolMessageData.asTransformedPayload(),
				),
			);
			return this.queryBus.execute(
				new GetRescueStationDeploymentQuery(
					reqUser.organizationId,
					rescueStationId,
				),
			);
		} catch (e) {
			this.throwPresentable(e);
			throw e;
		}
	}

	@Mutation(() => RescueStationDeploymentViewModel)
	async signInRescueStation(
		@RequestUser() reqUser: AuthUser,
		@Args('rescueStationData') rescueStationData: UpdateRescueStationInput,
		@Args('protocolMessageData') protocolMessageData: BaseCreateMessageArgs,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			await this.commandBus.execute(
				new StartSignOnProcessCommand(
					reqUser,
					rescueStationData,
					await protocolMessageData.asTransformedPayload(),
				),
			);
			return this.queryBus.execute(
				new GetRescueStationDeploymentQuery(
					reqUser.organizationId,
					rescueStationData.rescueStationId,
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
