import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzFormDirective } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { map } from 'rxjs';

import { Mutation } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import { markInvalidFormControlsAsDirty } from '@kordis/spa/core/misc';
import {
	PossibleAlertGroupSelectionsService,
	PossibleUnitSelectionsService,
} from '@kordis/spa/core/ui';

import {
	getOperationPayloadFromForm,
	makeCreateOperationForm,
} from '../../helper/create-operation-form.helper';
import { CreateOperationFormComponent } from './create-operation-form.component';

@Component({
	selector: 'krd-create-operation-modal',
	imports: [
		NzButtonComponent,
		NzColDirective,
		NzDividerComponent,
		NzFormDirective,
		NzRowDirective,
		ReactiveFormsModule,
		CreateOperationFormComponent,
	],
	providers: [
		PossibleUnitSelectionsService,
		PossibleAlertGroupSelectionsService,
	],
	templateUrl: `./create-operation-modal.component.html`,
	styleUrl: './create-operation-modal.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOperationModalComponent {
	private readonly fb = inject(NonNullableFormBuilder);
	readonly formGroup = makeCreateOperationForm(this.fb);
	readonly isLoading = signal(false);

	readonly #modal = inject(NzModalRef);
	private readonly gqlService = inject(GraphqlService);
	private readonly notificationService = inject(NzNotificationService);

	createOperation(): void {
		markInvalidFormControlsAsDirty(this.formGroup);
		if (this.formGroup.invalid) {
			return;
		}

		this.isLoading.set(true);

		this.gqlService
			.mutate$<{
				createOperation: Mutation['createOperation'];
			}>(
				gql`
					mutation CreateOperation($input: CreateOperationInput!) {
						createOperation(operation: $input) {
							id
							sign
						}
					}
				`,
				{
					input: getOperationPayloadFromForm(this.formGroup),
				},
			)
			.pipe(map((result) => result.createOperation))
			.subscribe({
				next: (operation) => {
					this.notificationService.success(
						'Einsatz erstellt',
						`Der Einsatz wurde mit der Einsatznummer ${operation.sign} erstellt.`,
						{ nzPlacement: 'topRight' },
					);
					this.#modal.destroy({
						operationId: operation.id,
					});
				},
				error: () =>
					this.notificationService.error(
						'Fehler',
						'Einsatz konnte nicht erstellt werden.',
					),
			})
			.add(() => this.isLoading.set(false));
	}
}
