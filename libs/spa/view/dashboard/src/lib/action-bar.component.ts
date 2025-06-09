import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { GlobalSearchComponent } from '@kordis/spa/core/misc';
import { RescueStationEditModalComponent } from '@kordis/spa/feature/deployment';
import {
	CreateOngoingOperationModalComponent,
	EndOperationModalComponent,
} from '@kordis/spa/feature/operation';

@Component({
	selector: 'krd-action-bar',
	imports: [
		CommonModule,
		GlobalSearchComponent,
		NzButtonComponent,
		NzIconModule,
		RouterLink,
		NzTooltipDirective,
	],
	template: `
		<div class="actions-container">
			<div class="group">
				<button
					(click)="openCreateOngoingOperationModal()"
					nz-button
					nzType="primary"
					nzDanger
				>
					Neuer Einsatz
				</button>
				<button nz-button nzType="primary" (click)="openEndOperationModal()">
					Einsatz beenden
				</button>
			</div>
			<div class="group">
				<button
					nz-tooltip="Einheit zu einem laufenden Einsatz zuordnen"
					nz-button
					nzType="primary"
				>
					Einheit zuordnen
				</button>
				<button
					nz-tooltip="Einheit aus einem laufenden Einsatz rauslösen"
					nz-button
					nzType="primary"
				>
					Einheit rauslösen
				</button>
			</div>
			<div class="group">
				<button nz-button nzType="primary" (click)="openRescueStationModal()">
					Rettungswache melden
				</button>
			</div>

			<a nz-button routerLink="/action-map" target="_blank">Karte</a>
		</div>
		<div class="search-container">
			<krd-global-search />
		</div>
	`,
	styles: `
		:host {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			width: 100%;
			gap: var(--base-spacing);

			.actions-container {
				display: flex;
				gap: calc(var(--base-spacing) * 2);

				.group {
					display: flex;
					flex-direction: row;
					gap: calc(var(--base-spacing) / 2);
				}

				nz-divider {
					height: 100%;
				}
			}

			.search-container {
				flex: 0 0 200px;
				transition: flex 0.3s ease-in-out;
				overflow: hidden;

				&:focus-within {
					flex-grow: 1;
				}
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionBarComponent {
	private readonly modalService = inject(NzModalService);

	openCreateOngoingOperationModal(): void {
		this.modalService.create({
			nzContent: CreateOngoingOperationModalComponent,
			nzFooter: null,
			nzNoAnimation: true,
			nzWidth: 550,
		});
	}

	openEndOperationModal(): void {
		this.modalService.create({
			nzContent: EndOperationModalComponent,
			nzFooter: null,
			nzNoAnimation: true,
			nzWidth: 550,
		});
	}

	openRescueStationModal(): void {
		this.modalService.create({
			nzContent: RescueStationEditModalComponent,
			nzFooter: null,
			nzNoAnimation: true,
			nzWidth: 550,
		});
	}
}
