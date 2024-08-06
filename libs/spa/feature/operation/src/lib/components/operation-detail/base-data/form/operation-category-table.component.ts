import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
} from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
} from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCheckboxComponent } from 'ng-zorro-antd/checkbox';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { OperationCategorySelectComponent } from './operation-category-select.component';


@Component({
	selector: 'krd-operation-category-table',
	standalone: true,
	imports: [
		CommonModule,
		NzButtonComponent,
		NzCheckboxComponent,
		NzIconDirective,
		NzInputNumberComponent,
		NzNoAnimationDirective,
		NzOptionComponent,
		NzSelectComponent,
		NzTableModule,
		OperationCategorySelectComponent,
		ReactiveFormsModule,
	],
	templateUrl: `./operation-category-table.component.html`,
	styles: `
		nz-table {
			.ant-table-footer {
				padding: 6px !important;
			}

			th,
			td:not(.empty-result) {
				padding: 2px 6px !important;
			}

			tr:hover:not(.ant-table-expanded-row) > td {
				background: unset;
			}

			tr td:last-child:not(.empty-result) {
				padding: 0 !important;
			}

			.empty-result {
				text-align: center;
				padding: 5px;
			}

			.footer {
				display: flex;
				justify-content: flex-end;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationCategoryTableComponent {
	readonly formArray = input.required<
		FormArray<
			FormGroup<{
				name: FormControl<string>;
				count: FormControl<number>;
				patientCount: FormControl<number>;
				dangerousSituationCount: FormControl<number>;
				wasDangerous: FormControl<boolean>;
			}>
		>
	>();
	private readonly fb = inject(FormBuilder);

	deleteCategory(index: number): void {
		this.formArray().removeAt(index);
	}

	addCategory(): void {
		this.formArray().push(
			this.fb.nonNullable.group({
				name: this.fb.nonNullable.control(''),
				count: this.fb.nonNullable.control(0),
				patientCount: this.fb.nonNullable.control(0),
				dangerousSituationCount: this.fb.nonNullable.control(0),
				wasDangerous: this.fb.nonNullable.control(false),
			}),
			// do not emit an event, as the user first has to choose a name in order for the category to be valid
			{ emitEvent: false },
		);
	}
}
