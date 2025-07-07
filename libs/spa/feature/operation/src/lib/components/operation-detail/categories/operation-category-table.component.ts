import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	effect,
	inject,
	input,
} from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
	ReactiveFormsModule,
} from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCheckboxComponent } from 'ng-zorro-antd/checkbox';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';

import { OperationCategorySelectComponent } from './operation-category-select.component';

@Component({
	selector: 'krd-operation-category-table',
	imports: [
		NzButtonComponent,
		NzCheckboxComponent,
		NzIconDirective,
		NzInputNumberComponent,
		NzTableModule,
		OperationCategorySelectComponent,
		ReactiveFormsModule,
	],
	templateUrl: `./operation-category-table.component.html`,
	styles: `
		td:last-child:not(.empty-result) {
			text-align: center;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationCategoryTableComponent implements OnDestroy {
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
	private readonly fb = inject(NonNullableFormBuilder);

	private readonly cleanupSubject$ = new Subject<void>();

	constructor() {
		const cd = inject(ChangeDetectorRef);
		effect(() => {
			this.cleanupSubject$.next();

			this.formArray()
				.valueChanges.pipe(
					// only trigger change detection if the length of the categories changes (external add)
					map((v) => v.length),
					distinctUntilChanged(),
					takeUntil(this.cleanupSubject$),
				)
				.subscribe(() => cd.detectChanges());
		});
	}

	ngOnDestroy(): void {
		this.cleanupSubject$.next();
		this.cleanupSubject$.complete();
	}

	deleteCategory(index: number): void {
		this.formArray().removeAt(index);
	}

	addCategory(): void {
		this.formArray().push(
			this.fb.group({
				name: this.fb.control(''),
				count: this.fb.control(0),
				patientCount: this.fb.control(0),
				dangerousSituationCount: this.fb.control(0),
				wasDangerous: this.fb.control(false),
			}),
			// do not emit an event, as the user first has to choose a name in order for the category to be valid
			{ emitEvent: false },
		);
	}
}
