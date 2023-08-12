import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { ShipPositionFeature } from '../../../core/entity/ship-position.entity';
import { ShipPositionsService } from '../../../core/service/ship-positions.service';

@Injectable()
export class NoopShipPositionsService implements ShipPositionsService {
	getChangeStream$(): Observable<ShipPositionFeature> {
		return of();
	}

	getAll(): Promise<ShipPositionFeature[]> {
		return Promise.resolve([]);
	}

	search(): Promise<ShipPositionFeature[]> {
		return Promise.resolve([]);
	}
}
