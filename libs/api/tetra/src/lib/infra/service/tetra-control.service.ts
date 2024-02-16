import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import * as querystring from 'querystring';
import { firstValueFrom } from 'rxjs';

import { TetraConfig } from '../../core/entity/tetra-config.entitiy';
import {
	TETRA_CONFIG_REPOSITORY,
	TetraConfigRepository,
} from '../../core/repository/tetra-config.repository';
import { TetraService } from '../../core/service/tetra.service';

export class TetraControlService implements TetraService {
	constructor(
		@Inject(TETRA_CONFIG_REPOSITORY)
		private readonly tetraConfigRepository: TetraConfigRepository,
		private readonly httpService: HttpService,
	) {}

	async sendCallOut(
		orgId: string,
		issi: string,
		message: string,
		noReply: boolean,
		prio?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
	): Promise<void> {
		const config = await this.getTetraConfigOrThrow(orgId);

		const params: Record<string, string | number> = {
			Ziel: issi,
			Typ: 195,
			Text: message,
			noreply: noReply ? 1 : 0,
			userkey: config.tetraControlApiUserKey,
		};

		if (prio) {
			params['COPrio'] = prio;
		}

		const queryParams = querystring.encode(params);
		const url = `${config.tetraControlApiUrl}/API/SDS?${queryParams}`;

		await firstValueFrom(this.httpService.get(url));
	}

	async sendSDS(
		orgId: string,
		issi: string,
		message: string,
		isFlash?: boolean,
	): Promise<void> {
		const config = await this.getTetraConfigOrThrow(orgId);

		const params: Record<string, string | number> = {
			Ziel: issi,
			Text: message,
			Flash: isFlash ? 1 : 0,
			userkey: config.tetraControlApiUserKey,
		};

		const queryParams = querystring.encode(params);
		const url = `${config.tetraControlApiUrl}/API/SDS?${queryParams}`;

		await firstValueFrom(this.httpService.get(url));
	}

	async sendStatus(
		orgId: string,
		issi: string,
		status: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
	): Promise<void> {
		const config = await this.getTetraConfigOrThrow(orgId);

		const params: Record<string, string | number> = {
			issi,
			status: this.convertFmsStatusToTetraStatus(status),
			userkey: config.tetraControlApiUserKey,
		};

		const queryParams = querystring.encode(params);
		const url = `${config.tetraControlApiUrl}/API/ISSIUPD?${queryParams}`;

		await firstValueFrom(this.httpService.get(url));
	}

	private convertFmsStatusToTetraStatus(fmsStatus: number): string {
		const hexDecimalStatusEquivalent = 32770 + fmsStatus;
		return hexDecimalStatusEquivalent.toString(16).toUpperCase();
	}

	private async getTetraConfigOrThrow(orgId: string): Promise<TetraConfig> {
		const config = await this.tetraConfigRepository.findByOrgId(orgId);
		if (!config) {
			throw new Error('Tetra config not found for orgId ' + orgId);
		}

		return config;
	}
}
