import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	OperationBaseAddress,
	OperationCategory,
	OperationLocation,
	OperationLocationAddress,
	OperationPatient,
} from '../../core/entity/operation.value-objects';
import { UpdateOperationDto } from '../../core/repository/dto/update-operation.dto';
import { UpdateOperationBaseDataInput } from '../controller/args/update-operation-base-data.args';
import { UpdateOperationDocumentDto } from '../repository/update-operation-document.dto';
import {
	OperationAddressDocument,
	OperationCategoryDocument,
	OperationLocationDocument,
	OperationPatientDocument,
} from '../schema/operation.schema';

@Injectable()
export class OperationDtoProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, UpdateOperationDto, UpdateOperationDocumentDto);
			createMap(mapper, UpdateOperationBaseDataInput, UpdateOperationDto);
			createMap(mapper, OperationLocation, OperationLocationDocument);
			createMap(mapper, OperationBaseAddress, OperationAddressDocument);
			createMap(mapper, OperationLocationAddress, OperationAddressDocument);
			createMap(mapper, OperationCategory, OperationCategoryDocument);
			createMap(mapper, OperationPatient, OperationPatientDocument);
		};
	}
}
