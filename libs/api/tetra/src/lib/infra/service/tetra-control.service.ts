import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import * as querystring from 'querystring';
import { firstValueFrom } from 'rxjs';

import { PublishTetraStatusCommand } from '../../core/command/publish-tetra-status.command';
import { TetraService } from '../../core/service/tetra.service';

export interface TetraControlStatusPayload {
	message: string;
	sender: string;
	type: string;
	timestamp: string;
	data: {
		type: 'status';
		status: string;
		statusCode: string;
		statusText: string;
		destSSI: string;
		destName: string;
		srcSSI: string;
		srcName: string;
		ts: string;
		radioID: number;
		radioName: string;
		remark: string;
	};
}

export interface TetraControlWebhookHandlers {
	handleStatusWebhook(payload: TetraControlStatusPayload): Promise<void>;
}

export class TetraControlService
	implements TetraService, TetraControlWebhookHandlers
{
	private readonly tetraControlUrl: string;
	private readonly tetraControlKey: string;

	constructor(
		private readonly httpService: HttpService,
		private readonly commandBus: CommandBus,
		config: ConfigService,
	) {
		this.tetraControlUrl = config.getOrThrow<string>('TETRA_CONTROL_URL');
		this.tetraControlKey = config.getOrThrow<string>('TETRA_CONTROL_KEY');
	}

	async sendCallOut(
		issi: string,
		message: string,
		noReply: boolean,
		prio?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
	): Promise<void> {
		const params: Record<string, string | number> = {
			Ziel: issi,
			Typ: 195,
			Text: message,
			noreply: noReply ? 1 : 0,
			userkey: this.tetraControlKey,
		};

		if (prio) {
			params['COPrio'] = prio;
		}

		const queryParams = querystring.encode(params);
		const url = `${this.tetraControlUrl}/API/SDS?${queryParams}`;

		await firstValueFrom(this.httpService.get(url));
	}

	async sendSDS(
		issi: string,
		message: string,
		isFlash?: boolean,
	): Promise<void> {
		const params: Record<string, string | number> = {
			Ziel: issi,
			Text: message,
			Flash: isFlash ? 1 : 0,
			userkey: this.tetraControlKey,
		};

		const queryParams = querystring.encode(params);
		const url = `${this.tetraControlUrl}/API/SDS?${queryParams}`;

		await firstValueFrom(this.httpService.get(url));
	}

	async sendStatus(
		issi: string,
		status: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
	): Promise<void> {
		const params: Record<string, string | number> = {
			issi,
			status: this.convertFmsStatusToTetraStatus(status),
			userkey: this.tetraControlKey,
		};

		const queryParams = querystring.encode(params);
		const url = `${this.tetraControlUrl}/API/ISSIUPD?${queryParams}`;

		await firstValueFrom(this.httpService.get(url));
	}

	async handleStatusWebhook(payload: TetraControlStatusPayload): Promise<void> {
		if (!payload.data.status) {
			return;
		}

		await this.commandBus.execute(
			new PublishTetraStatusCommand(
				payload.sender,
				parseInt(payload.data.status),
				this.getSanitizedTimestamp(payload.timestamp),
			),
		);
	}

	private getSanitizedTimestamp(timestamp: string): Date {
		const parsedTimestamp = /\/Date\((-?\d+)\)\//.exec(timestamp);
		if (parsedTimestamp && parsedTimestamp.length > 1) {
			return new Date(parseInt(parsedTimestamp[1]));
		}

		return new Date();
	}

	private convertFmsStatusToTetraStatus(fmsStatus: number): string {
		const hexDecimalStatusEquivalent = 32770 + fmsStatus;
		return hexDecimalStatusEquivalent.toString(16).toUpperCase();
	}
}
