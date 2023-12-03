import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Feature } from '@turf/turf';
import { Model } from 'mongoose';
import { firstValueFrom, map } from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';

import { Warning } from '../../core/model/warning.model';
import { WarningsService } from '../../core/service/warnings.service';
import { NINA_SOURCES_TOKEN } from './nina-sources';

const NINA_WARNING_POPULATION_URL =
	'https://nina.api.proxy.bund.dev/api31/warnings';

@Injectable()
export class NinaWarningsService implements WarningsService {
	private readonly logger: KordisLogger = new Logger('WarningService');

	constructor(
		@InjectModel(Warning.name)
		private readonly warningModel: Model<Warning>,
		private readonly httpService: HttpService,
		@Inject(NINA_SOURCES_TOKEN)
		private readonly ninaSourcesOfInterest: string[],
	) {}

	async getWarningsForLocation(lat: number, lon: number): Promise<Warning[]> {
		return this.warningModel
			.where('affectedLocations')
			.intersects({
				type: 'Point',
				coordinates: [lon, lat],
			})
			.lean()
			.exec();
	}

	async getNewWarnings(): Promise<Warning[]> {
		// we need to get the warnings in sequence, otherwise we might get rate limited/ or get timeouts
		const newWarnings: Warning[] = [];
		const warningsToKeep: string[] = [];

		for (const url of this.ninaSourcesOfInterest) {
			const sourceWarnings = await firstValueFrom(
				this.httpService
					.get<{ id: string; version: number }[]>(url)
					.pipe(map(({ data }) => data)),
			);

			this.logger.debug(`Found ${sourceWarnings.length} warnings from ${url}`);

			for (const { id, version } of sourceWarnings) {
				const existingWarning = await this.warningModel
					.findOne({
						sourceId: id,
					})
					.exec();
				if (existingWarning) {
					warningsToKeep.push(id);
					if (existingWarning.sourceVersion === version) {
						this.logger.debug(
							`Skipping warning ${id} since version ${version} already exists in DB`,
						);
						continue;
					}
				}

				const newWarning = await this.fetchPopulatedWarning(id, version);

				if (newWarning) {
					if (existingWarning) {
						this.logger.debug(
							`Replacing warning ${id} with new version ${existingWarning.sourceVersion} -> ${version}`,
						);

						await existingWarning.replaceOne(newWarning).exec();
					} else {
						this.logger.debug(`Saving warning ${id}`);

						warningsToKeep.push(id);
						await this.warningModel.create(newWarning);
					}
					newWarnings.push(newWarning);
				}
			}
		}

		const deleteResult = await this.warningModel
			.deleteMany({
				sourceId: { $nin: warningsToKeep },
			})
			.exec();
		this.logger.debug(
			`Deleted ${deleteResult.deletedCount} warnings since they were not present in NINA anymore`,
		);

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
			mapData.info.find(
				({ language }: { language: string }) =>
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
