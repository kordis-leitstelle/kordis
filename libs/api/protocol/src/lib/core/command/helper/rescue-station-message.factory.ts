import { Injectable } from '@nestjs/common';

import { RescueStationMessagePayload } from '../../entity/protocol-entries/rescue-station/rescue-station-message-payload.entity';
import { RescueStationSignOnMessage } from '../../entity/protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { RescueStationUpdateMessage } from '../../entity/protocol-entries/rescue-station/rescue-station-update-message.entity';
import { CreateRescueStationSignOnMessageCommand } from '../rescue-station/create-rescue-station-sign-on-message.command';
import { CreateRescueStationUpdateMessageCommand } from '../rescue-station/create-rescue-station-update-message.command';
import { setProtocolMessageBaseFromCommandHelper } from './set-protocol-message-base-from-command.helper';

@Injectable()
export class RescueStationMessageFactory {
	async createSignOnMessageFromCommand(
		cmd: CreateRescueStationSignOnMessageCommand,
	): Promise<RescueStationSignOnMessage> {
		const msg = new RescueStationSignOnMessage();
		msg.searchableText = this.makeSearchableText('anmeldung', cmd);
		setProtocolMessageBaseFromCommandHelper(cmd, msg);
		msg.payload = this.makeMessagePayload(cmd);

		return msg;
	}

	async createUpdateMessageFromCommand(
		cmd: CreateRescueStationUpdateMessageCommand,
	): Promise<RescueStationUpdateMessage> {
		const msg = new RescueStationUpdateMessage();
		msg.searchableText = this.makeSearchableText('nachmeldung', cmd);
		setProtocolMessageBaseFromCommandHelper(cmd, msg);
		msg.payload = this.makeMessagePayload(cmd);

		return msg;
	}

	private makeMessagePayload(
		cmd:
			| CreateRescueStationSignOnMessageCommand
			| CreateRescueStationUpdateMessageCommand,
	): RescueStationMessagePayload {
		const msgPayload = new RescueStationMessagePayload();
		msgPayload.rescueStationId = cmd.rescueStation.id;
		msgPayload.rescueStationName = cmd.rescueStation.name;
		msgPayload.rescueStationCallSign = cmd.rescueStation.callSign;
		msgPayload.strength = cmd.rescueStation.strength;
		msgPayload.units = cmd.rescueStation.units;
		msgPayload.alertGroups = cmd.rescueStation.alertGroups;
		return msgPayload;
	}

	private makeSearchableText(
		actionPrefix: string,
		{ rescueStation }: CreateRescueStationSignOnMessageCommand,
	): string {
		const strength = rescueStation.strength;
		const strengthString = `${strength.leaders}/${strength.subLeaders}/${strength.helpers}/${strength.leaders + strength.subLeaders + strength.helpers}`;

		const unitString = rescueStation.units
			.map(({ name, callSign }) => `${name} ${callSign}`)
			.join(', ');

		const alertGroupString = rescueStation.alertGroups
			.map(
				({ name, units }) =>
					`${name} ${units.map(({ name, callSign }) => `${name} ${callSign}`)}`,
			)
			.join(', ');

		return `${actionPrefix} rettungswache ${rescueStation.name} ${rescueStation.callSign} stärke ${strengthString} ${unitString ? `einheiten ${unitString} ` : ''}${alertGroupString ? `alarmgruppen ${alertGroupString}` : ''}`.trimEnd();
	}
}
