import { Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InfoCircleOutline } from '@ant-design/icons-angular/icons';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { Subject, debounceTime, delay, switchMap, tap } from 'rxjs';

import { Unit } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { DeploymentNotePopupComponent } from '../deployment-note-popup.component';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
	selector: 'krd-deployment-unit',
	standalone: true,
	imports: [
		DeploymentNotePopupComponent,
		NzCardComponent,
		NzIconDirective,
		NzPopoverModule,
		NzTooltipDirective,
		StatusBadgeComponent,
	],
	template: `
		<ng-template #notePopoverContent>
			<krd-note-popup
				[note]="unit().note"
				(noteChange)="updateNote($event)"
				[isLoading]="isNoteUpdating()"
			/>
		</ng-template>
		<nz-card
			(click)="$event.stopPropagation()"
			nz-popover
			[nzPopoverBackdrop]="true"
			[nzPopoverTitle]="unit().callSign + ' - ' + unit().name"
			[nzPopoverContent]="notePopoverContent"
			nzPopoverTrigger="click"
		>
			<div class="header-row">
				<span>
					{{ unit().callSign }}
					@if (unit().note) {
						<i nz-icon nzType="info-circle" [nz-tooltip]="unit().note"> </i>
					}
				</span>
				<krd-status-badge [status]="unit().status?.status" />
			</div>
			<div class="name">
				<span>{{ unit().name }}</span>
			</div>
		</nz-card>
	`,
	styles: `
		nz-card {
			.ant-card-body {
				display: flex;
				flex-direction: column;
				padding: calc(var(--base-spacing) / 2) var(--base-spacing);
			}

			.header-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			.name {
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 0.9rem;
				color: grey;
			}
		}

		nz-card:hover {
			border-color: var(--ant-primary-color);
			cursor: pointer;
		}
	`,
})
export class DeploymentUnitComponent {
	readonly unit = input.required<Unit>();
	protected isNoteUpdating = signal(false);
	private noteUpdatedSubject$ = new Subject<string>();
	private gqlService = inject(GraphqlService);

	constructor(iconService: NzIconService) {
		iconService.addIcon(InfoCircleOutline);

		// a deployment unit is updatable in every context, so we can safely implement it here (not like deployment card, which not always has a note)
		this.noteUpdatedSubject$
			.pipe(
				debounceTime(300),
				tap(() => this.isNoteUpdating.set(true)),
				switchMap((note) =>
					this.gqlService.mutate$(
						gql`
							mutation UpdateUnitNote($unitId: ID!, $note: String!) {
								updateUnitNote(unitId: $unitId, note: $note) {
									id
									note
								}
							}
						`,
						{
							unitId: this.unit().id,
							note,
						},
					),
				),
				delay(300), // eye candy for loading spinner
				takeUntilDestroyed(),
			)
			.subscribe(() => this.isNoteUpdating.set(false));
	}

	updateNote(note: string): void {
		this.noteUpdatedSubject$.next(note);
	}
}
