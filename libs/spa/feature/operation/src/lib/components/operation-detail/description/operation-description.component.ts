import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
	FormControl,
	NonNullableFormBuilder,
	ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, pipe } from 'rxjs';

import { Operation } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { BaseOperationTabComponent } from '../base-operation-tab.component';
import { OperationDescriptionTextareaComponent } from './operation-description-textarea.component';

@Component({
	selector: 'krd-operation-description',
	imports: [ReactiveFormsModule, OperationDescriptionTextareaComponent],
	template: ` <krd-operation-description-textarea
		[formControl]="descriptionControl"
	/>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationDescriptionComponent extends BaseOperationTabComponent {
	readonly descriptionControl: FormControl<string>;

	constructor() {
		const _control = inject(NonNullableFormBuilder).control('');
		super(
			'description',
			gql`
				query GetOperationDescription($operationId: ID!) {
					operation(id: $operationId) {
						id
						description
					}
				}
			`,
			gql`
				mutation UpdateOperationBaseData(
					$operationId: ID!
					$formValue: String!
				) {
					updateOperationBaseData(
						id: $operationId
						data: { description: $formValue }
					) {
						id
						description
					}
				}
			`,
			_control,
			pipe(distinctUntilChanged(), debounceTime(500)),
		);
		this.descriptionControl = _control;
	}

	protected setValue(operation: Operation): void {
		this.descriptionControl.setValue(operation.description, {
			emitEvent: false,
		});
	}
}
