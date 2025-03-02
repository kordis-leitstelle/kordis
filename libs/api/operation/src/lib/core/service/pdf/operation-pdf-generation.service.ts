import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import {
	GetOrganizationQuery,
	OrganizationViewModel,
} from '@kordis/api/organization';
import {
	AlertGroupViewModel,
	GetAlertGroupsByIdsQuery,
	GetUnitsByIdsQuery,
	UnitViewModel,
} from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import { OperationEntity } from '../../entity/operation.entity';
import {
	OperationAlertGroupInvolvement,
	OperationUnitInvolvement,
} from '../../entity/operation.value-objects';
import {
	OPERATION_TEMPLATE_RENDERER,
	OperationTemplateRenderer,
} from '../operation-template.renderer';
import {
	PDF_GENERATION_SERVICE,
	PdfGenerationService,
} from './pdf-generation.service';

@Injectable()
export class OperationPdfGenerationService {
	constructor(
		@Inject(PDF_GENERATION_SERVICE)
		private readonly pdfGenerationService: PdfGenerationService,
		private readonly queryBus: QueryBus,
		@Inject(OPERATION_TEMPLATE_RENDERER)
		private readonly operationTemplateRenderer: OperationTemplateRenderer,
	) {}

	async generatePdf(
		operation: OperationEntity,
		reqUser: AuthUser,
	): Promise<ArrayBuffer> {
		const organization: OrganizationViewModel = await this.queryBus.execute(
			new GetOrganizationQuery(reqUser.organizationId),
		);
		const generatedAt = new Date();
		operation = await this.getPopulatedOperation(operation);

		const generatedBy = `${reqUser.firstName[0]}. ${reqUser.lastName}`;

		const renderedTemplate = this.operationTemplateRenderer.renderTemplate({
			...operation,
			generatedAt,
			generatedBy,
			orgName: organization.name,
		});

		return this.pdfGenerationService.generatePdf(renderedTemplate);
	}
	// as units and alert groups are foreign fields, the domain query will only return their ids. We have to populate them by querying them from their respective domains
	private async getPopulatedOperation(
		operation: OperationEntity,
	): Promise<OperationEntity> {
		// get all units from unit involvements and alert group involvements
		const units: UnitViewModel[] = await this.queryBus.execute(
			new GetUnitsByIdsQuery([
				...operation.unitInvolvements.map((involvement) => involvement.unit.id),
				...operation.alertGroupInvolvements.flatMap((involvement) =>
					involvement.unitInvolvements.flatMap(
						(involvement) => involvement.unit.id,
					),
				),
			]),
		);

		// set the populated units to the operation
		operation.unitInvolvements = this.getEnrichedUnitInvolvements(
			operation.unitInvolvements,
			units.splice(0, operation.unitInvolvements.length),
		);

		// set the populated alert groups to the operation and their units
		operation.alertGroupInvolvements = this.getEnrichedAlertGroupInvolvements(
			operation.alertGroupInvolvements,
			await this.queryBus.execute(
				new GetAlertGroupsByIdsQuery(
					operation.alertGroupInvolvements.map(
						(involvement) => involvement.alertGroup.id,
					),
				),
			),
			units,
		);

		return operation;
	}

	private getEnrichedUnitInvolvements(
		unitInvolvements: OperationUnitInvolvement[],
		units: UnitViewModel[],
	): OperationUnitInvolvement[] {
		return unitInvolvements.map((involvement, i) => {
			involvement.unit = units[i];
			return involvement;
		});
	}

	private getEnrichedAlertGroupInvolvements(
		alertGroupInvolvements: OperationAlertGroupInvolvement[],
		alertGroups: AlertGroupViewModel[],
		units: UnitViewModel[],
	): OperationAlertGroupInvolvement[] {
		let unitIndex = 0;
		return alertGroupInvolvements.map((alertGroupInvolvement, i) => {
			alertGroupInvolvement.alertGroup = alertGroups[i];
			alertGroupInvolvement.unitInvolvements =
				alertGroupInvolvement.unitInvolvements.map((unitInvolvement) => {
					unitInvolvement.unit = units[unitIndex++];
					return unitInvolvement;
				});
			return alertGroupInvolvement;
		});
	}
}
