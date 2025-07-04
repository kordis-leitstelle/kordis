import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import {
	DeploymentNotFoundException,
	GetRescueStationDeploymentQuery,
	RescueStationDeploymentViewModel,
} from '@kordis/api/deployment';
import { ProtocolMessageInput } from '@kordis/api/protocol';
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
		@Args() { protocolMessage }: ProtocolMessageInput,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			await this.commandBus.execute(
				new LaunchUpdateSignedInRescueStationProcessCommand(
					reqUser,
					rescueStationData,
					protocolMessage ? await protocolMessage.asTransformedPayload() : null,
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
		@Args() { protocolMessage }: ProtocolMessageInput,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			await this.commandBus.execute(
				new LaunchSignOffProcessCommand(
					reqUser,
					rescueStationId,
					protocolMessage ? await protocolMessage.asTransformedPayload() : null,
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
		@Args() { protocolMessage }: ProtocolMessageInput,
	): Promise<RescueStationDeploymentViewModel> {
		try {
			await this.commandBus.execute(
				new LaunchSignOnProcessCommand(
					reqUser,
					rescueStationData,
					protocolMessage ? await protocolMessage.asTransformedPayload() : null,
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
