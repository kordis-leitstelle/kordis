import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import Handlebars from 'handlebars';

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
	OperationLocationAddress,
	OperationUnitInvolvement,
} from '../../entity/operation.value-objects';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore due to types missing when operation is imported as feature module
import operationPdfTemplate from './operation-pdf.hbs';
import {
	PDF_GENERATION_SERVICE,
	PdfGenerationService,
} from './pdf-generation.service';

@Injectable()
export class OperationPdfGenerationService {
	private readonly operationPdfRenderer: HandlebarsTemplateDelegate;

	constructor(
		@Inject(PDF_GENERATION_SERVICE)
		private readonly pdfGenerationService: PdfGenerationService,
		private readonly queryBus: QueryBus,
	) {
		this.registerHandlebarsHelpers();
		this.operationPdfRenderer = Handlebars.compile(operationPdfTemplate);
	}

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

		const renderedTemplate = this.operationPdfRenderer({
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

	private registerHandlebarsHelpers(): void {
		Handlebars.registerHelper('toDateString', (date: Date) =>
			date
				?.toLocaleString('de-DE', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
				})
				.replace(',', ''),
		);
		Handlebars.registerHelper('toBirthDateString', (date: Date | null) =>
			date
				? `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
				: '-',
		);
		Handlebars.registerHelper('emptyMark', (value: unknown) => value ?? '-');
		Handlebars.registerHelper(
			'toLocationString',
			(value: OperationLocationAddress) =>
				[
					value.name,
					value.street,
					value.postalCode && value.city
						? `${value.postalCode} ${value.city}`
						: value.postalCode || value.city,
				]
					.filter(Boolean)
					.join(', '),
		);
	}
}
