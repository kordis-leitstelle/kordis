import { Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { Coordinate } from './coordinate.model';


@Injectable()
export class CoordinateProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper: Mapper): void => {
			createMap(mapper, Coordinate, Coordinate);
		};
	}
}
