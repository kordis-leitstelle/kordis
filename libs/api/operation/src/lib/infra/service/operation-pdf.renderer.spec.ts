import { plainToInstance } from 'class-transformer';

import { UnitViewModel } from '@kordis/api/unit';

import { OperationEntity } from '../../core/entity/operation.entity';
import {
	OperationAlertGroupInvolvement,
	OperationCategory,
	OperationUnitInvolvement,
} from '../../core/entity/operation.value-objects';
import { OperationTemplateRenderer } from '../../core/service/operation-template.renderer';
import { OperationTemplateRendererImpl } from './operation-pdf.renderer';

const EXPECTED_OPERATION_PDF_RENDER_RESULT = `<html lang='de'>
          <head>
                <meta charset='UTF-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1.0' />
                <title>Kordis Einsatzprotokoll 2024/01/001</title>
                <script src='https://cdn.tailwindcss.com'></script>
                <style>
                        @page { size: A4; margin: 10mm; @top-left { content: element(header-left);
                                padding-top: 10mm; } @top-center { content: element(header-center);
                                padding-top: 10mm; } @top-right { content: element(header-right);
                                padding-top: 10mm; } @bottom-left { content: element(footer-left);
                                padding-bottom: 10mm; } @bottom-right { content: element(footer-right);
                                padding-bottom: 10mm; } } #footer-left { position: running(footer-left); }
                        #footer-right { position: running(footer-right); } #footer-right:after {
                                                                                                                                                                                                                                content: counter(page) ' von ' counter(pages); } #header-left { position:
                                running(header-left); } #header-center { position: running(header-center);
                                                                                                                                } #header-right { position: running(header-right); }
                </style>
                <style type='text/tailwindcss'>
                        body { @apply text-sm; } header { @apply border-b-[1px] border-gray-200
                        text-xs mb-6; } footer { @apply border-t-[1px] border-gray-200 text-xs
                        mt-6; } section > span { @apply text-lg mb-1 block; }
                        section:not(:last-child) { @apply mb-6; } table { @apply min-w-full
                        divide-y divide-gray-200; th { @apply whitespace-nowrap text-left
                        font-semibold; } } .base-data { @apply
                        grid grid-cols-3 gap-y-2; div { @apply border-t border-gray-200; } dt {
                                                                                                                                                                                                                                @apply text-sm font-medium leading-6; } dd { @apply mt-1 text-sm leading-6
                        text-gray-700; } }
                </style>
          </head>
          <body>
          <header id='header-left'>2024/01/001</header>
          <header id='header-center'>Einsatzprotokoll</header>
          <header id='header-right'>Test Organization</header>
          <footer id='footer-right'></footer>
          <footer id='footer-left'>
                Generiert mit Kordis am
                31.01.2025 18:16:39
                von
                J. Doe
          </footer>
          <section>
                <span>Grunddaten</span>
                <dl class='base-data'>
                        <div>
                                <dt>Einsatznummer</dt>
                                <dd>2024/01/001</dd>
                        </div>
                        <div>
                                <dt>Einsatzbeginn</dt>
                                <dd>Invalid Date</dd>
                        </div>
                        <div>
                                <dt>Einsatzende</dt>
                                <dd>Invalid Date </dd>
                        </div>
                        <div>
                                <dt>Alarmstichwort</dt>
                                <dd>THWAY</dd>
                        </div>
                        <div>
                                <dt>Alarmierung</dt>
                                <dd>Some Reporter</dd>
                        </div>
                        <div>
                                <dt>Einsatzleiter/in</dt>
                                <dd>Master of Disaster</dd>
                        </div>
                        <div>
                                <dt>Einsatzaddresse</dt>
                                <dd>Test Location, Test Street, 12345 Test City</dd>
                        </div>
                        <div>
                                <dt>Koordinaten</dt>
                                <dd>
                                                <p>-</p>
                                </dd>
                        </div>
                        <div>
                                <dt>Externe Nummer</dt>
                                <dd>ID12341231</dd>
                        </div>
                </dl>
          </section>
          <section>
                <span>Beschreibung</span>
                <p>
                        Something bad happened, but fortunately the DLRG was quick and saved many lives! https://spenden.dlrg.de/
                </p>
          </section>
          <section>
                <span>Einsatzarten</span>
                <table>
                        <thead>
                        <tr>
                                <th>Einsatzart</th>
                                <th>Anzahl</th>
                                <th>Geholfene Personen</th>
                                <th>Bedrohliche Situationen</th>
                                <th>Gefahr für Helfer</th>
                        </tr>
                        </thead>
                        <tbody>
                                <tr>
                                        <td>THL</td>
                                        <td>1</td>
                                        <td>1</td>
                                        <td>0</td>
                                        <td>Nein</td>
                                </tr>
                        </tbody>
                </table>
          </section>
          <section>
                <span>Eingebundene Komponenten</span>
                <table>
                        <thead>
                        <tr>
                                <th>Einheit</th>
                                <th>Zeiten</th>
                        </tr>
                        </thead>
                        <tbody>
                                <tr>
                                        <td>U1 - Unit 1</td>
                                        <td>
                                                <ul class='list-disc px-5'>
                                                                <li>01.01.2024 01:20:00
                                                                        -
                                                                        01.01.2024 01:25:00</li>
                                                                <li>01.01.2024 01:30:00
                                                                        -
                                                                        01.01.2024 01:40:00</li>
                                                </ul>
                                        </td>
                                </tr>
                                <tr>
                                        <th colspan='2' class='pt-0.5'></th>
                                </tr>
                                        <tr>
                                                <td>U2 - Unit 2</td>
                                                <td>
                                                        <ul class='list-disc px-5'>
                                                                        <li>01.01.2024 01:00:00
                                                                                -
                                                                                01.01.2024 01:09:00</li>
                                                                        <li>01.01.2024 01:10:00
                                                                                -
                                                                                01.01.2024 01:20:00</li>
                                                        </ul>
                                                </td>
                                        </tr>
                        </tbody>
                </table>
          </section>
          <section>
                <span>Protokoll</span>
                <table>
                        <thead>
                        <tr>
                                <th>Zeit</th>
                                <th>Von</th>
                                <th>An</th>
                                <th>Nachricht</th>
                                <th>Kanal</th>
                                <th>Disponent</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                </table>
          </section>
          <section>
                <span>Patienten</span>
                <table>
                        <thead>
                        <tr>
                                <th>Name</th>
                                <th>Geburtstag</th>
                                <th>Adresse</th>
                                <th>Telefonnummer</th>
                                <th>Verbleib</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                </table>
          </section>
          <section class='mt-20'>
                <div class='flex justify-between'>
                        <div class='text-center'>
                                <p>_________________________</p>
                                <p>Einsatzleiter/in</p>
                        </div>
                        <div class='text-center'>
                                <p>_________________________</p>
                                <p>Disponent/in</p>
                        </div>
                        <div class='text-center'>
                                <p>_________________________</p>
                                <p>Leiter/in Einsatz</p>
                        </div>
                </div>
          </section>
          </body>
          </html>
`
	.replace(/\s+/g, ' ')
	.trim();

describe('OperationTemplateRendererImpl', () => {
	let service: OperationTemplateRenderer;
	beforeEach(() => {
		service = new OperationTemplateRendererImpl();
	});

	it('should render template', async () => {
		//region Operation Data
		const operation = new OperationEntity();
		operation.sign = '2024/01/001';
		operation.start = new Date('2024-01-01T00:0:00Z');
		operation.end = new Date('2024-01-01T00:40:00ZZ');
		operation.unitInvolvements = [
			plainToInstance(OperationUnitInvolvement, {
				unit: {
					id: 'unit-id-1',
					name: 'Unit 1',
					callSign: 'U1',
				} as UnitViewModel,
				involvementTimes: [
					{
						start: new Date('2024-01-01T00:20:00Z'),
						end: new Date('2024-01-01T00:25:00Z'),
					},
					{
						start: new Date('2024-01-01T00:30:00Z'),
						end: new Date('2024-01-01T00:40:00Z'),
					},
				],
			}),
		];
		operation.alertGroupInvolvements = [
			{
				alertGroup: { id: 'alert-group-id-1' },
				unitInvolvements: [
					plainToInstance(OperationUnitInvolvement, {
						unit: {
							id: 'unit-id-2',
							name: 'Unit 2',
							callSign: 'U2',
						} as UnitViewModel,
						involvementTimes: [
							{
								start: new Date('2024-01-01T00:00:00Z'),
								end: new Date('2024-01-01T00:09:00Z'),
							},
							{
								start: new Date('2024-01-01T00:10:00Z'),
								end: new Date('2024-01-01T00:20:00Z'),
							},
						],
					}),
				],
			} as OperationAlertGroupInvolvement,
		];
		operation.alarmKeyword = 'THWAY';
		operation.categories = [
			plainToInstance(OperationCategory, {
				dangerousSituationCount: 0,
				name: 'THL',
				count: 1,
				patientCount: 1,
				wasDangerous: false,
			}),
		];
		operation.commander = 'Master of Disaster';
		operation.description =
			'Something bad happened, but fortunately the DLRG was quick and saved many lives! https://spenden.dlrg.de/';
		operation.externalReference = 'ID12341231';
		operation.reporter = 'Some Reporter';
		operation.location = {
			address: {
				name: 'Test Location',
				street: 'Test Street',
				postalCode: '12345',
				city: 'Test City',
			},
			coordinate: {
				lat: 43.321,
				lon: 9.123,
			},
		};
		//endregion

		// expect template resolved successfully
		expect(
			service
				.renderTemplate({
					...operation,
					generatedAt: new Date('2025-01-31T17:16:39Z'),
					generatedBy: 'J. Doe',
					orgName: 'Test Organization',
				})
				.replace(/\s+/g, ' ')
				.trim(),
		).toEqual(EXPECTED_OPERATION_PDF_RENDER_RESULT);
	});
});
