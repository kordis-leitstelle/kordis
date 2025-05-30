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

import { LaunchSignOffProcessCommand } from '../../core/command/launch-sign-off-process.command';
import { LaunchSignOnProcessCommand } from '../../core/command/launch-sign-on-process.command';
import { LaunchUpdateSignedInRescueStationProcessCommand } from '../../core/command/launch-update-signed-in-rescue-station-process.command';
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
		@Args('protocolMessageData', {
			nullable: true,
			type: () => BaseCreateMessageArgs,
		})
		protocolMessageData: BaseCreateMessageArgs | null,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			const protocolPayload = protocolMessageData
				? await protocolMessageData.asTransformedPayload()
				: null;
			await this.commandBus.execute(
				new LaunchUpdateSignedInRescueStationProcessCommand(
					reqUser,
					rescueStationData,
					protocolPayload,
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
				new LaunchSignOffProcessCommand(
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
				new LaunchSignOnProcessCommand(
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
