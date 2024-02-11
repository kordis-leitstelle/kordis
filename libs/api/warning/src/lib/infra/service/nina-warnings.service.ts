import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Warning } from '../../core/model/warning.model';
import { WarningsService } from '../../core/service/warnings.service';
import { filter, Observable } from 'rxjs';
import { GEOSPATIAL_SERVICE, GeospatialService } from '@kordis/api/geospatial';
import { Feature, Geometry } from '@turf/turf';
import { BackgroundJob } from '@kordis/api/shared';

@Injectable()
export class NinaWarningsService implements WarningsService {
	constructor(
		private readonly ninaWarningsBackgroundJob: BackgroundJob<Warning>,
		@InjectModel(Warning.name)
		private readonly warningModel: Model<Warning>,
		@Inject(GEOSPATIAL_SERVICE)
		private readonly geospatialService: GeospatialService,
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

	getWarningsInGeometryStream$(geom: Geometry | Feature): Observable<Warning> {
		return this.ninaWarningsBackgroundJob
			.getChangeStream$()
			.pipe(
				filter((warning: Warning) =>
					warning.affectedLocations.geometries.some((warningGeom) =>
						this.geospatialService.isIntersecting(warningGeom, geom),
					),
				),
			);
	}
}
