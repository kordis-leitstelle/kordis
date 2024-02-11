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
		const warningsToKeep: string[] = [];

		for (const url of this.ninaSources) {
			const sourceWarnings = await firstValueFrom(
				this.httpService
					.get<{ id: string; version: number }[]>(url)
					.pipe(map(({ data }) => data)),
			);

			for (const { id, version } of sourceWarnings) {
				const existingWarning = await this.warningModel
					.findOne({
						sourceId: id,
					})
					.exec();
				if (existingWarning) {
					warningsToKeep.push(id);
					if (existingWarning.sourceVersion === version) {
						continue;
					}
				}

				const newWarning = await this.fetchPopulatedWarning(id, version);

				if (newWarning) {
					if (existingWarning) {
						await existingWarning.replaceOne(newWarning).exec();
					} else {
						warningsToKeep.push(id);
						await this.warningModel.create(newWarning);
					}
					newWarnings.push(newWarning);
				}
			}
		}

		await this.warningModel
			.deleteMany({
				sourceId: { $nin: warningsToKeep },
			})
			.exec();

		return newWarnings;
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
