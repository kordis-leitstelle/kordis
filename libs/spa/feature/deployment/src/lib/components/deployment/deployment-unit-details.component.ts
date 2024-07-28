import {
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	input,
	output,
	signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { Subject, debounceTime, delay, switchMap, tap } from 'rxjs';

import { Unit } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { STATUS_EXPLANATIONS } from '../../status-explanations';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
	selector: 'krd-deployment-unit-details',
	standalone: true,
	imports: [
		FormsModule,
		NzInputDirective,
		NzRadioModule,
		NzSpinComponent,
		NzTooltipDirective,
		StatusBadgeComponent,
	],
	templateUrl: './deployment-unit-details.component.html',
	styles: `
		nz-spin {
			position: absolute;
			top: 0;
			right: 0;
			padding: 5px 16px 4px;
		}

		textarea {
			resize: none;
		}

		.status {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentUnitDetailsComponent {
	readonly unit = input.required<Unit>();
	readonly unitStatusUpdated = output<void>();
	note = '';
	status?: number;
	readonly isLoading = signal(false);

	protected readonly STATUS_EXPLANATIONS = STATUS_EXPLANATIONS;
	private readonly noteUpdatedSubject$ = new Subject<void>();
	private readonly gqlService = inject(GraphqlService);
	private readonly statusUpdatedSubject$ = new Subject<void>();

	constructor() {
		effect(() => {
			this.status = this.unit().status?.status;
		});
		effect(() => {
			this.note = this.unit().note;
		});
		this.watchNoteUpdates();
	}

	updateNote(): void {
		this.noteUpdatedSubject$.next();
	}

	updateStatus(): void {
		this.isLoading.set(true);
		this.gqlService
			.mutate$(
				gql`
					mutation UpdateUnitStatus($unitId: String!, $status: Int!) {
						updateUnitStatus(unitId: $unitId, status: $status) {
							id
							status {
								status
								source
								receivedAt
							}
						}
					}
				`,
				{
					unitId: this.unit().id,
					status: this.status,
				},
			)
			.subscribe(() => this.unitStatusUpdated.emit())
			.add(() => this.isLoading.set(false));
	}

	private watchNoteUpdates(): void {
		this.noteUpdatedSubject$
			.pipe(
				debounceTime(300),
				tap(() => this.isLoading.set(true)),
				switchMap(() =>
					this.gqlService.mutate$(
						gql`
							mutation UpdateUnitNote($unitId: String!, $note: String!) {
								updateUnitNote(unitId: $unitId, note: $note) {
									id
									note
								}
							}
						`,
						{
							unitId: this.unit().id,
							note: this.note,
						},
					),
				),
				delay(300), // eye candy for loading spinner
				takeUntilDestroyed(),
			)
			.subscribe(() => this.isLoading.set(false));
	}
}
