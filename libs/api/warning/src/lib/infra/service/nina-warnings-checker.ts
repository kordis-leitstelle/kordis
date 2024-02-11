import { HttpService } from '@nestjs/axios';
import { Feature } from '@turf/turf';
import { Model } from 'mongoose';
import { firstValueFrom, map } from 'rxjs';

import { Warning } from '../../core/model/warning.model';

const NINA_WARNING_POPULATION_URL =
	'https://nina.api.proxy.bund.dev/api31/warnings';

export class NinaWarningsChecker {
	constructor(
		private readonly warningModel: Model<Warning>,
		private readonly ninaSources: string[],
		private readonly httpService: HttpService,
	) {}

	async getNewWarnings(): Promise<Warning[]> {
		const newWarnings: Warning[] = [];
		const warningsToKeep = new Set<string>();

		for (const url of this.ninaSources) {
			await this.retrieveAndSyncWarnings(url, newWarnings, warningsToKeep);
		}

		await this.cleanupWarnings(warningsToKeep);

		return newWarnings;
	}

	private async retrieveAndSyncWarnings(
		url: string,
		newWarnings: Warning[],
		warningsToKeep: Set<string>,
	): Promise<void> {
		const sourceWarnings = await this.fetchSourceWarnings(url);
		for (const { id, version } of sourceWarnings) {
			await this.syncWarningWithSource(
				id,
				version,
				newWarnings,
				warningsToKeep,
			);
		}
	}

	private async fetchSourceWarnings(
		url: string,
	): Promise<{ id: string; version: number }[]> {
		return firstValueFrom(
			this.httpService
				.get<{ id: string; version: number }[]>(url)
				.pipe(map(({ data }) => data)),
		);
	}

	private async syncWarningWithSource(
		id: string,
		version: number,
		newWarnings: Warning[],
		warningsToKeep: Set<string>,
	): Promise<void> {
		const existingWarning = await this.warningModel
			.findOne({ sourceId: id })
			.exec();
		if (existingWarning) {
			warningsToKeep.add(id);
			if (existingWarning.sourceVersion === version) return;
		}

		const newWarning = await this.fetchPopulatedWarning(id, version);
		if (!newWarning) return;

		if (existingWarning) {
			await existingWarning.replaceOne(newWarning).exec();
		} else {
			warningsToKeep.add(id);
			await this.warningModel.create(newWarning);
		}
		newWarnings.push(newWarning);
	}

	private async cleanupWarnings(warningsToKeep: Set<string>): Promise<void> {
		await this.warningModel
			.deleteMany({ sourceId: { $nin: Array.from(warningsToKeep) } })
			.exec();
	}

	private async fetchPopulatedWarning(
		id: string,
		version: number,
	): Promise<Warning | null> {
		const [mapData, featureCollection] = await Promise.all([
			firstValueFrom(
				this.httpService
					.get(`${NINA_WARNING_POPULATION_URL}/${id}.json`)
					.pipe(map(({ data }) => data)),
			),
			firstValueFrom(
				this.httpService
					.get(`${NINA_WARNING_POPULATION_URL}/${id}.geojson`)
					.pipe(map(({ data }) => data)),
			),
		]);
		const info =
			mapData.info.find(({ language }: { language: string }) =>
				language?.toLowerCase()?.includes('de'),
			) || mapData.info?.[0];

		if (info && featureCollection) {
			return {
				sourceId: mapData.identifier,
				sourceVersion: version,
				sentAt: new Date(mapData.sent),
				sender: info.senderName || mapData.sender,
				severity: info.severity,
				effective: info.effective ? new Date(info.effective) : null,
				expires: info.expires ? new Date(info.expires) : null,
				title: info.headline,
				description: info.description,
				instruction: info.instruction,
				affectedLocations: {
					type: 'GeometryCollection',
					geometries: featureCollection.features.map(
						({ geometry }: Feature) => geometry,
					),
				},
			};
		}

		return null;
	}
}
