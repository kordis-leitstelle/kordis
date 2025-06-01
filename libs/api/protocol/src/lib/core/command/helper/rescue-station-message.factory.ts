import { Injectable } from '@nestjs/common';

import { RescueStationMessagePayload } from '../../entity/protocol-entries/rescue-station/rescue-station-message-payload.entity';
import { RescueStationSignOnMessage } from '../../entity/protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { RescueStationUpdateMessage } from '../../entity/protocol-entries/rescue-station/rescue-station-update-message.entity';
import { CreateRescueStationSignOnMessageCommand } from '../rescue-station/create-rescue-station-sign-on-message.command';
import { CreateRescueStationUpdateMessageCommand } from '../rescue-station/create-rescue-station-update-message.command';
import { setProtocolEntryBaseFromCommandHelper } from './set-protocol-entry-base-from-command.helper';

@Injectable()
export class RescueStationMessageFactory {
	async createSignOnMessageFromCommand(
		cmd: CreateRescueStationSignOnMessageCommand,
	): Promise<RescueStationSignOnMessage> {
		const msg = new RescueStationSignOnMessage();
		setProtocolEntryBaseFromCommandHelper(cmd, msg);

		msg.referenceId = cmd.rescueStation.id;
		msg.searchableText = this.makeSearchableText('anmeldung', cmd);
		msg.payload = this.makeMessagePayload(cmd);

		return msg;
	}

	async createUpdateMessageFromCommand(
		cmd: CreateRescueStationUpdateMessageCommand,
	): Promise<RescueStationUpdateMessage> {
		const msg = new RescueStationUpdateMessage();
		setProtocolEntryBaseFromCommandHelper(cmd, msg);

		msg.referenceId = cmd.rescueStation.id;
		msg.searchableText = this.makeSearchableText('nachmeldung', cmd);
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
		const { strength, units, alertGroups, name, callSign } = rescueStation;
		const strengthString = `${strength.leaders}/${strength.subLeaders}/${strength.helpers}/${strength.leaders + strength.subLeaders + strength.helpers}`;

		const unitStrings = units.map(
			({ name, callSign }) => `${name} ${callSign}`,
		);
		const unitString = unitStrings.length
			? `einheiten ${unitStrings.join(', ')} `
			: '';

		const alertGroupStrings = alertGroups.map(({ name, units }) => {
			const unitNames = units
				.map(({ name, callSign }) => `${name} ${callSign}`)
				.join(', ');
			return `${name} ${unitNames}`;
		});
		const alertGroupString = alertGroupStrings.length
			? `alarmgruppen ${alertGroupStrings.join(', ')}`
			: '';

		return `${actionPrefix} rettungswache ${name} ${callSign} stärke ${strengthString} ${unitString}${alertGroupString}`.trimEnd();
	}
}
