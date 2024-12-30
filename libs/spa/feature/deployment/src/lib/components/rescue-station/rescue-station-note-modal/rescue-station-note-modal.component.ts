import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import { FormsModule, NonNullableFormBuilder } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { RescueStationDeployment } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

@Component({
	selector: 'krd-rescue-station-note-modal',
	imports: [NzButtonComponent, FormsModule, NzInputDirective],
	template: `
		<h3>{{ rescueStation.name }}</h3>

		<textarea
			nz-input
			[(ngModel)]="note"
			[rows]="5"
			placeholder="Notiz"
		></textarea>

		<div class="actions">
			<button
				nz-button
				nzType="primary"
				[nzLoading]="isLoading()"
				[disabled]="isLoading()"
				(click)="updateNote()"
			>
				Speichern
			</button>
		</div>
	`,
	styles: `
		.actions {
			display: flex;
			justify-content: flex-end;
			margin-top: var(--base-spacing);
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RescueStationNoteModalComponent {
	readonly rescueStation: RescueStationDeployment = inject(NZ_MODAL_DATA);
	readonly isLoading = signal(false);
	readonly note = signal(this.rescueStation.note);

	private readonly modal = inject(NzModalRef);
	private readonly gqlService = inject(GraphqlService);
	private readonly fb = inject(NonNullableFormBuilder);
	private readonly notificationService = inject(NzNotificationService);

	updateNote(): void {
		this.isLoading.set(true);
		this.gqlService
			.mutate$(
				gql`
					mutation UpdateRescueStationNote($id: ID!, $note: String!) {
						updateRescueStationNote(id: $id, note: $note) {
							id
							note
						}
					}
				`,
				{
					id: this.rescueStation.id,
					note: this.note(),
				},
			)
			.subscribe(() => {
				this.notificationService.success(
					'Erfolgreich',
					'Notiz wurde aktualisiert',
				);
				this.modal.close();
			});
	}
}
