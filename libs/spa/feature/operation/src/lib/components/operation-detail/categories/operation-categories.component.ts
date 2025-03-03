import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
} from '@angular/forms';

import { Operation } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { BaseOperationTabComponent } from '../base-operation-tab.component';
import { OperationCategoryTableComponent } from './operation-category-table.component';

const CATEGORY_QUERY_FIELDS = `
	categories {
		name
		count
		patientCount
		dangerousSituationCount
		wasDangerous
	}
`;

type CategoryFormGroup = FormGroup<{
	name: FormControl<string>;
	count: FormControl<number>;
	patientCount: FormControl<number>;
	dangerousSituationCount: FormControl<number>;
	wasDangerous: FormControl<boolean>;
}>;

@Component({
	selector: 'krd-operation-categories',
	imports: [OperationCategoryTableComponent],
	template: `<krd-operation-category-table [formArray]="formArray" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationCategoriesComponent extends BaseOperationTabComponent {
	readonly formArray: FormArray<CategoryFormGroup>;

	constructor(private readonly fb: NonNullableFormBuilder) {
		const _control = fb.array<CategoryFormGroup>([]);

		super(
			'categories',
			gql`
				query GetOperationCategories($operationId: ID!) {
					operation(id: $operationId) {
						${CATEGORY_QUERY_FIELDS}
					}
				}
			`,
			gql`
				mutation UpdateOperationCategories(
					$operationId: ID!
					$formValue: [OperationCategoryInput!]!
				) {
					updateOperationBaseData(id: $operationId, data:{ categories: $formValue}) {
						${CATEGORY_QUERY_FIELDS}
					}
				}
			`,
			_control,
		);

		this.formArray = _control;
	}

	protected override setValue({ categories }: Operation): void {
		this.formArray.clear({ emitEvent: false });

		for (const category of categories) {
			this.formArray.push(
				this.fb.group({
					name: this.fb.control(category.name),
					count: this.fb.control(category.count),
					patientCount: this.fb.control(category.patientCount),
					dangerousSituationCount: this.fb.control(
						category.dangerousSituationCount,
					),
					wasDangerous: this.fb.control(category.wasDangerous),
				}),
			);
		}
	}
}
