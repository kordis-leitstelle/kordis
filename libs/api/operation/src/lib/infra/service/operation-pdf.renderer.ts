import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';

import { OperationLocationAddress } from '../../core/entity/operation.value-objects';
import {
	OperationTemplatePayload,
	OperationTemplateRenderer,
} from '../../core/service/operation-template.renderer';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore due to types missing when operation is imported as feature module
import operationPdfTemplate from './operation-pdf.hbs';

@Injectable()
export class OperationTemplateRendererImpl
	implements OperationTemplateRenderer
{
	private readonly operationPdfRenderer: HandlebarsTemplateDelegate;

	constructor() {
		this.registerHandlebarsHelpers();
		this.operationPdfRenderer = Handlebars.compile(operationPdfTemplate);
	}

	renderTemplate(operation: OperationTemplatePayload): string {
		return this.operationPdfRenderer(operation);
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
