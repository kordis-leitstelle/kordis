import { ChangeDetectionStrategy, Component } from '@angular/core';
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
	standalone: true,
	imports: [ReactiveFormsModule, OperationDescriptionTextareaComponent],
	template: ` <krd-operation-description-textarea
		[formControl]="descriptionControl"
	/>`,
	styles: `
		:host {
			height: 100%;
			flex-grow: 1;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationDescriptionComponent extends BaseOperationTabComponent {
	readonly descriptionControl: FormControl<string>;

	protected setValue(operation: Operation): void {
		this.descriptionControl.setValue(operation.description, {
			emitEvent: false,
		});
	}

	constructor(fb: NonNullableFormBuilder) {
		const _control = fb.control('');
		super(
			'description',
			gql`
				query GetOperationDescription($operationId: String!) {
					operation(id: $operationId) {
						id
						description
					}
				}
			`,
			gql`
				mutation UpdateOperationBaseData(
					$operationId: String!
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
}
